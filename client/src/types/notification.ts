import { User } from './auth';

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'COMMENT_MENTION'
  | 'PROJECT_ROLE_ASSIGNED'
  | 'ORGANIZATION_INVITE';

export interface Notification {
  id: string;
  _id: string;
  recipientId: string;
  senderId?: User;
  organizationId?: { name: string; slug: string };
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
