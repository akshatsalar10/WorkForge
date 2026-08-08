import { Notification, INotification, NotificationType } from '../models/notification.model';
import { getIO } from '../socket';
import { AppError } from '../utils/appError';
import { Types } from 'mongoose';

export class NotificationService {
  static async createNotification(data: {
    recipientId: string;
    senderId?: string;
    organizationId?: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
  }): Promise<INotification> {
    // Prevent self-notifications
    if (data.senderId && data.senderId === data.recipientId) {
      return null as any;
    }

    const notification = await Notification.create({
      recipientId: new Types.ObjectId(data.recipientId),
      senderId: data.senderId ? new Types.ObjectId(data.senderId) : undefined,
      organizationId: data.organizationId ? new Types.ObjectId(data.organizationId) : undefined,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      isRead: false
    });

    const populated = await notification.populate([
      { path: 'senderId', select: 'name email avatarUrl' },
      { path: 'organizationId', select: 'name slug' }
    ]);

    // Real-time Socket.IO emission
    const io = getIO();
    if (io) {
      io.to(`user:${data.recipientId}`).emit('notification:new', populated);
    }

    return populated;
  }

  static async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipientId: userId })
        .populate('senderId', 'name email avatarUrl')
        .populate('organizationId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipientId: userId }),
      Notification.countDocuments({ recipientId: userId, isRead: false })
    ]);

    return {
      notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({ recipientId: userId, isRead: false });
  }

  static async markAsRead(userId: string, notificationId: string): Promise<INotification> {
    const notification = await Notification.findOne({ _id: notificationId, recipientId: userId });
    if (!notification) {
      throw new AppError('Notification not found.', 404);
    }

    notification.isRead = true;
    await notification.save();
    return notification;
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ recipientId: userId, isRead: false }, { isRead: true });
  }

  static async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const notification = await Notification.findOne({ _id: notificationId, recipientId: userId });
    if (!notification) {
      throw new AppError('Notification not found.', 404);
    }

    await Notification.findByIdAndDelete(notificationId);
  }
}
