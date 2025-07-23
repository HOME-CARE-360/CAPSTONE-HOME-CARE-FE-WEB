import { z } from 'zod';

export const bookingSchema = z.object({
  id: z.number(),
  customerId: z.number(),
  providerId: z.number(),
  note: z.string(),
  preferredDate: z.string(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  location: z.string(),
  phoneNumber: z.string(),
  categoryId: z.number(),
  Category: z.object({
    logo: z.string().nullable(),
    name: z.string(),
  }),
  customer: z.object({
    address: z.string().nullable(),
    gender: z.string().nullable(),
    avatar: z.string().nullable(),
    name: z.string(),
    phone: z.string(),
    email: z.string(),
  }),
});

export type Booking = z.infer<typeof bookingSchema>;

export const bookingResponseSchema = z.object({
  data: z.array(bookingSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type BookingResponse = z.infer<typeof bookingResponseSchema>;
