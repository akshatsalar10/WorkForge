import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').max(200, 'Task title cannot exceed 200 characters'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().datetime({ offset: true }).or(z.string().date()).optional().nullable(),
  labels: z.array(z.string()).optional(),
  subtasks: z.array(z.object({ title: z.string().min(1), isCompleted: z.boolean().default(false) })).optional(),
  dependencies: z.array(z.string()).optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').max(200, 'Task title cannot exceed 200 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  order: z.number().optional(),
  labels: z.array(z.string()).optional(),
  subtasks: z.array(z.object({ _id: z.string().optional(), title: z.string().min(1), isCompleted: z.boolean() })).optional(),
  dependencies: z.array(z.string()).optional()
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  order: z.number().optional()
});

export const createLabelSchema = z.object({
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color')
});
