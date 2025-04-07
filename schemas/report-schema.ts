import { z } from 'zod';

const UploadedFileSchema = z.object({
  url: z.string().url(),
  public_id: z.string(),
  format: z.string(),
  type: z.enum(['image', 'video', 'raw']),
  original_filename: z.string(),
});

export const reportSchema = z.object({
  subject: z.string().min(1),
  content: z.string().min(10),
  itemId: z.string(),
  itemName: z.string(),
  type: z.enum(['bot', 'server']),
  severity: z
    .enum(['severe', 'moderate', 'low', 'untagged'])
    .default('untagged'),
  reportedById: z.string(),
  attachments: z.array(UploadedFileSchema).optional(),
});
