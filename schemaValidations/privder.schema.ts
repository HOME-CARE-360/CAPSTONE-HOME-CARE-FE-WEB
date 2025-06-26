import { z } from 'zod';

export const providerSchema = z.object({
  id: z.number(),
  description: z.string().optional().nullable(),
  address: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  userId: z.number(),
  companyType: z.string(),
  industry: z.string().optional().nullable(),
  licenseNo: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  taxId: z.string(),
  verificationStatus: z.string(),
  verifiedAt: z.string().optional().nullable(),
  verifiedById: z.number().optional().nullable(),
});

export type ProviderType = z.infer<typeof providerSchema>;
