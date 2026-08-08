import { User } from './auth';
import { Project } from './project';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Label {
  id: string;
  _id: string;
  organizationId: string;
  name: string;
  color: string;
}

export interface Subtask {
  _id?: string;
  id?: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  _id: string;
  organizationId: string;
  projectId: Project;
  taskKey: string;
  taskNumber: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  assigneeId?: User;
  reporterId: User;
  dueDate?: string;
  labels: Label[];
  watchers: User[];
  subtasks: Subtask[];
  dependencies: Task[];
  createdAt: string;
  updatedAt: string;
}
