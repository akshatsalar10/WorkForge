import { z } from 'zod';

export const createAttachmentSchema = z.object({
  entityType: z.enum(['TASK', 'COMMENT', 'ORGANIZATION']),
  entityId: z.string().min(1, 'Entity ID is required')
});
