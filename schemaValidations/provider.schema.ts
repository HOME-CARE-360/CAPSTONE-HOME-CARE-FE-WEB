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

export const providerDashboardResponseSchema = z.object({
  range: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),

  bookings: z.object({
    total: z.number(),
    byStatus: z.object({
      PENDING: z.number(),
      CONFIRMED: z.number(),
      IN_PROGRESS: z.number(),
      COMPLETED: z.number(),
      CANCELLED: z.number(),
      WAIT_FOR_PAYMENT: z.number(),
    }),
  }),

  revenue: z.object({
    totalPaid: z.number(),
    paidCount: z.number(),
  }),

  rating: z.object({
    avg: z.number(),
    count: z.number(),
  }),

  customers: z.object({
    unique: z.number(),
    repeat: z.number(),
  }),

  serviceRequests: z.object({
    PENDING: z.number(),
    WAIT_FOR_PAYMENT: z.number(),
    IN_PROGRESS: z.number(),
  }),

  conversations: z.object({
    conversationsWithUnread: z.number(),
    unreadTotal: z.number(),
  }),

  wallet: z.object({
    balance: z.number(),
  }),

  withdrawals: z.record(z.any()),

  series: z.object({
    range: z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }),
    granularity: z.string(), // có thể refine sau: z.enum(["day", "week", "month"])
    revenue: z.array(z.any()), // chưa có ví dụ nên để any, nếu có format thì refine
    bookings: z.array(
      z.object({
        bucket: z.string(), // ISO date (YYYY-MM-DD)
        value: z.number(),
      })
    ),
  }),

  topServices: z.array(
    z.object({
      serviceId: z.number(),
      name: z.string(),
      basePrice: z.string(),
      quantity: z.number(),
    })
  ),
});

export type ProviderDashboardResponseType = z.infer<typeof providerDashboardResponseSchema>;
export type ProviderType = z.infer<typeof providerSchema>;
