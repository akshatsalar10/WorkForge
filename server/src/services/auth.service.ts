import { User, IUser } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRandomToken, hashToken } from '../utils/token';
import { AppError } from '../utils/appError';
import crypto from 'crypto';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async register(data: { name: string; email: string; password: string }): Promise<{ user: IUser; tokens: AuthTokens }> {
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = generateRandomToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      isEmailVerified: false,
      verificationToken: hashToken(verificationToken),
      verificationTokenExpires
    });

    const tokens = await this.createSession(user._id.toString());
    return { user, tokens };
  }

  static async login(
    data: { email: string; password: string },
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: IUser; tokens: AuthTokens }> {
    const user = await User.findOne({ email: data.email.toLowerCase() }).select('+password');
    if (!user || !user.password) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const tokens = await this.createSession(user._id.toString(), ipAddress, userAgent);
    return { user, tokens };
  }

  static async refreshToken(
    rawRefreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthTokens> {
    const tokenHash = hashToken(rawRefreshToken);
    const session = await RefreshToken.findOne({ tokenHash });

    if (!session) {
      throw new AppError('Invalid refresh token session.', 401);
    }

    // Token reuse detection & revocation of family
    if (session.isRevoked) {
      await RefreshToken.updateMany({ family: session.family }, { isRevoked: true });
      throw new AppError('Security Alert: Refresh token re-use detected. All active sessions revoked.', 401);
    }

    if (session.expiresAt < new Date()) {
      throw new AppError('Refresh token expired. Please log in again.', 401);
    }

    // Revoke old token and issue new token in the same family (Token Rotation)
    session.isRevoked = true;
    await session.save();

    const newRawRefreshToken = generateRandomToken();
    const newHash = hashToken(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
      userId: session.userId,
      tokenHash: newHash,
      family: session.family,
      isRevoked: false,
      expiresAt,
      ipAddress,
      userAgent
    });

    const user = await User.findById(session.userId);
    if (!user) {
      throw new AppError('User no longer exists.', 401);
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email
    });

    return {
      accessToken,
      refreshToken: newRawRefreshToken
    };
  }

  static async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) return;
    const tokenHash = hashToken(rawRefreshToken);
    await RefreshToken.findOneAndUpdate({ tokenHash }, { isRevoked: true });
  }

  static async verifyEmail(token: string): Promise<void> {
    const hashed = hashToken(token);
    const user = await User.findOne({
      verificationToken: hashed,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token.', 400);
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
  }

  static async forgotPassword(email: string): Promise<string> {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return dummy token indicator so timing doesn't leak user existence
      return 'sent';
    }

    const resetToken = generateRandomToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Note: Email sending service will be wired up in background job module
    return resetToken;
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashed = hashToken(token);
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() }
    }).select('+password');

    if (!user) {
      throw new AppError('Invalid or expired password reset token.', 400);
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Revoke all existing refresh sessions for security
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user || !user.password) {
      throw new AppError('User not found.', 404);
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 400);
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    // Revoke sessions
    await RefreshToken.updateMany({ userId: user._id }, { isRevoked: true });
  }

  static async updateProfile(
    userId: string,
    data: { name?: string; avatarUrl?: string }
  ): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;

    await user.save();
    return user;
  }

  private static async createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthTokens> {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email
    });

    const rawRefreshToken = generateRandomToken();
    const tokenHash = hashToken(rawRefreshToken);
    const family = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      family,
      isRevoked: false,
      expiresAt,
      ipAddress,
      userAgent
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }
}
