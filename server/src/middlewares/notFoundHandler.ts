import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Resource not found - ${req.originalUrl}`, 404));
};
