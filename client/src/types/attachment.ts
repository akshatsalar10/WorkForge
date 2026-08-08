import { User } from './auth';

export type AttachmentEntityType = 'TASK' | 'COMMENT' | 'ORGANIZATION';

export interface Attachment {
  id: string;
  _id: string;
  organizationId: string;
  uploaderId: User;
  entityType: AttachmentEntityType;
  entityId: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  key: string;
  createdAt: string;
}
