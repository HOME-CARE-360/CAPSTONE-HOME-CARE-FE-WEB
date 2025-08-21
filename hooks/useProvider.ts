import { useQuery } from '@tanstack/react-query';
import { providerService } from '@/lib/api/services/fetchProvider';
import { z } from 'zod';
import { ProviderDashboardResponseType } from '@/schemaValidations/provider.schema';

// Dashboard query schema
const dashboardQuerySchema = z.object({
  // startDate: z.coerce.date(),
  // endDate: z.coerce.date(),
  granularity: z.enum(['day', 'week', 'month']).optional().default('day'),
});
// .refine((d) => d.endDate > d.startDate, {
//     message: "endDate phải lớn hơn startDate",
//     path: ["endDate"],
// });

type DashboardQueryParams = z.infer<typeof dashboardQuerySchema>;

// Helper function to create dates in UTC without timezone conversion
// const createUTCDate = (year: number, month: number, day: number, isStartDate: boolean = true): Date => {
//     if (isStartDate) {
//         // Create date for start of day in UTC
//         return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
//     } else {
//         // Create date for end of day in UTC
//         return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
//     }
// };

/**
 * Hook to fetch provider dashboard data
 */
export function useProviderDashboard(params?: DashboardQueryParams) {
  return useQuery({
    queryKey: ['provider', 'dashboard', params ? JSON.stringify(params) : 'default'],
    queryFn: () => providerService.getDashboardProvider(params),
    // enabled: !params || (!!params.startDate && !!params.endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    select: (response: ProviderDashboardResponseType) => ({
      ...response,
    }),
  });
}

/**
 * Hook to fetch provider dashboard data with default date range (last 30 days)
 */
export function useProviderDashboardDefault() {
  // const now = new Date();
  // const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const defaultParams: DashboardQueryParams = {
    // startDate: createUTCDate(
    //     thirtyDaysAgo.getUTCFullYear(),
    //     thirtyDaysAgo.getUTCMonth() + 1,
    //     thirtyDaysAgo.getUTCDate(),
    //     true
    // ),
    // endDate: createUTCDate(
    granularity: 'day',
  };

  return useProviderDashboard(defaultParams);
}

/**
 * Hook to fetch provider dashboard data for current month
 */
export function useProviderDashboardCurrentMonth() {
  // const now = new Date();
  // const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const currentMonthParams: DashboardQueryParams = {
    // startDate: createUTCDate(
    //     startOfMonth.getUTCFullYear(),
    //     startOfMonth.getUTCMonth() + 1,
    //     startOfMonth.getUTCDate(),
    //     true
    // ),
    // endDate: createUTCDate(
    //     endOfMonth.getUTCFullYear(),
    //     endOfMonth.getUTCMonth() + 1,
    //     endOfMonth.getUTCDate(),
    //     false
    // ),
    granularity: 'day',
  };

  return useProviderDashboard(currentMonthParams);
}

/**
 * Hook to fetch provider dashboard data for current week
 */
export function useProviderDashboardCurrentWeek() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

  const currentWeekParams: DashboardQueryParams = {
    // startDate: createUTCDate(
    //     startOfWeek.getUTCFullYear(),
    //     startOfWeek.getUTCMonth() + 1,
    //     startOfWeek.getUTCDate(),
    //     true
    // ),
    // endDate: createUTCDate(
    //     endOfWeek.getUTCFullYear(),
    //     endOfWeek.getUTCMonth() + 1,
    //     endOfWeek.getUTCDate(),
    //     false
    // ),
    granularity: 'day',
  };

  return useProviderDashboard(currentWeekParams);
}
