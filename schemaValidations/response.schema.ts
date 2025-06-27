import { z } from 'zod';

export const responseMessageSchema = z.object({
  message: z.string(),
});

export type ResponseMessageType = z.infer<typeof responseMessageSchema>;
