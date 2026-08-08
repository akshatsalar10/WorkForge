import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100, 'Project name cannot exceed 100 characters'),
  key: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(10, 'Project key cannot exceed 10 characters')
    .regex(/^[A-[a-zA-Z0-9]+$/, 'Project key must contain only letters and numbers')
    .transform((val) => val.toUpperCase())
    .optional(),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).default('ACTIVE'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  startDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  dueDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  teamId: z.string().optional()
});

export const updateProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100, 'Project name cannot exceed 100 characters').optional(),
  description: z.string().optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  teamId: z.string().optional().nullable()
});

export const addProjectMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['MANAGER', 'MEMBER', 'VIEWER']).default('MEMBER')
});

export const updateProjectMemberRoleSchema = z.object({
  role: z.enum(['MANAGER', 'MEMBER', 'VIEWER'])
});
