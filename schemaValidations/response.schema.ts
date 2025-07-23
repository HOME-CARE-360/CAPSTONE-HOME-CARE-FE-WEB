import { z } from 'zod';

export const responseMessageSchema = z.object({
  message: z.string(),
});

export type ResponseMessageType = z.infer<typeof responseMessageSchema>;

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => {
  return z.object({
    success: z.boolean(),
    code: z.string(),
    message: z.string(),
    statusCode: z.number(),
    timestamp: z.string(),
    data: z.object({
      data: z.array(itemSchema),
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });
};

export const createResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => {
  return z.object({
    success: z.boolean(),
    code: z.string(),
    message: z.string(),
    statusCode: z.number(),
    timestamp: z.string(),
    data: dataSchema,
  });
};

// Hàm tái sử dụng cho cả paginated và non-paginated
export const buildPaginationResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
  options?: { paginated?: boolean }
) => {
  const base = {
    success: z.boolean(),
    code: z.string(),
    message: z.string(),
    statusCode: z.number(),
    timestamp: z.string(),
  };

  if (options?.paginated) {
    return z.object({
      ...base,
      data: z.object({
        data: z.array(dataSchema),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean(),
      }),
    });
  } else {
    return z.object({
      ...base,
      data: dataSchema,
    });
  }
};
