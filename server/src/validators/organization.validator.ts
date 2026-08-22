import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  slug: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .max(30, 'Slug cannot exceed 30 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
      .optional()
  ),
  logoUrl: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().url('Logo URL must be valid').optional()
  )
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').optional(),
  logoUrl: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().url('Logo URL must be valid').optional()
  )
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER')
});

export const changeMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER'])
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required')
});
