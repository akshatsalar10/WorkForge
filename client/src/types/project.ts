import { User } from './auth';
import { Team } from './team';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ProjectRole = 'MANAGER' | 'MEMBER' | 'VIEWER';

export interface Project {
  id: string;
  _id: string;
  organizationId: string;
  name: string;
  key: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: string;
  dueDate?: string;
  ownerId: User;
  teamId?: Team;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  id: string;
  _id: string;
  projectId: string;
  userId: User;
  role: ProjectRole;
  joinedAt: string;
}
