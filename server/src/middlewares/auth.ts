import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';
import { User } from '../models/user.model';
import { AppError } from '../utils/appError';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      return next(new AppError('User session invalid or user no longer exists.', 401));
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired. Please refresh your session.', 401));
    }
    return next(new AppError('Invalid authentication token.', 401));
  }
};
