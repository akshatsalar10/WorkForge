import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiResponse } from '../utils/apiResponse';

export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await NotificationService.getUserNotifications(req.user!._id.toString(), page, limit);

      return ApiResponse.success({
        res,
        message: 'Notifications fetched.',
        data: result.notifications,
        meta: {
          ...result.pagination,
          unreadCount: result.unreadCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await NotificationService.getUnreadCount(req.user!._id.toString());
      return ApiResponse.success({
        res,
        message: 'Unread count fetched.',
        data: { unreadCount: count }
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await NotificationService.markAsRead(req.user!._id.toString(), req.params.id);
      return ApiResponse.success({
        res,
        message: 'Notification marked as read.',
        data: { notification }
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user!._id.toString());
      return ApiResponse.success({
        res,
        message: 'All notifications marked as read.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationService.deleteNotification(req.user!._id.toString(), req.params.id);
      return ApiResponse.success({
        res,
        message: 'Notification deleted.'
      });
    } catch (error) {
      next(error);
    }
  }
}
