import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(50, 'Team name cannot exceed 50 characters'),
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional(),
  members: z.array(z.string()).optional()
});

export const updateTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(50, 'Team name cannot exceed 50 characters').optional(),
  description: z.string().max(200, 'Description cannot exceed 200 characters').optional()
});

export const addTeamMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required')
});
