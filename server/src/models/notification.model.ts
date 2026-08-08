import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'COMMENT_MENTION'
  | 'PROJECT_ROLE_ASSIGNED'
  | 'ORGANIZATION_INVITE';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  senderId?: Types.ObjectId;
  organizationId?: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      index: true
    },
    type: {
      type: String,
      enum: ['TASK_ASSIGNED', 'TASK_STATUS_CHANGED', 'COMMENT_MENTION', 'PROJECT_ROLE_ASSIGNED', 'ORGANIZATION_INVITE'],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    link: {
      type: String,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Compound index for querying user notifications sorted by time
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

notificationSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: Record<string, any>) {
    delete ret.__v;
    return ret;
  }
});

export const Notification = model<INotification>('Notification', notificationSchema);
