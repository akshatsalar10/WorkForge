import { User } from './auth';

export interface Team {
  id: string;
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  members: User[];
  createdAt: string;
  updatedAt: string;
}
