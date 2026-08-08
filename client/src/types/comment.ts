import { User } from './auth';

export interface Comment {
  id: string;
  _id: string;
  organizationId: string;
  taskId: string;
  authorId: User;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  _id: string;
  organizationId: string;
  entityType: 'TASK' | 'PROJECT' | 'ORGANIZATION';
  entityId: string;
  actorId: User;
  action: string;
  details?: Record<string, any>;
  createdAt: string;
}
