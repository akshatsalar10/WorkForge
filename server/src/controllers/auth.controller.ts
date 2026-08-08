import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, tokens } = await AuthService.register(req.body);
      return ApiResponse.success({
        res,
        statusCode: 201,
        message: 'Account registered successfully.',
        data: { user, tokens }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');
      const { user, tokens } = await AuthService.login(req.body, ipAddress, userAgent);

      return ApiResponse.success({
        res,
        message: 'Login successful.',
        data: { user, tokens }
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      const tokens = await AuthService.refreshToken(refreshToken, ipAddress, userAgent);
      return ApiResponse.success({
        res,
        message: 'Token refreshed successfully.',
        data: { tokens }
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      return ApiResponse.success({
        res,
        message: 'Logged out successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success({
        res,
        message: 'Current user fetched.',
        data: { user: req.user }
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      await AuthService.verifyEmail(token);
      return ApiResponse.success({
        res,
        message: 'Email address verified successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      return ApiResponse.success({
        res,
        message: 'If an account exists with that email address, password reset instructions have been sent.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      return ApiResponse.success({
        res,
        message: 'Password reset successfully. Please log in with your new password.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user!._id.toString(), currentPassword, newPassword);
      return ApiResponse.success({
        res,
        message: 'Password changed successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.updateProfile(req.user!._id.toString(), req.body);
      return ApiResponse.success({
        res,
        message: 'Profile updated successfully.',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
}
