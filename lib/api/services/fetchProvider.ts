import apiService from '@/lib/api/core';
import { ProviderDashboardResponseType } from '@/schemaValidations/provider.schema';
import z from 'zod';

const dashboardQuerySchema = z.object({
  // startDate: z.coerce.date(),   // chấp nhận nhiều định dạng hợp lệ của Date, gồm ISO
  // endDate: z.coerce.date(),
  granularity: z.enum(['day', 'week', 'month']).optional().default('day'),
});
// .refine((d) => d.endDate > d.startDate, {
//     message: "endDate phải lớn hơn startDate",
//     path: ["endDate"],
// });
type DashboardQueryParams = z.infer<typeof dashboardQuerySchema>;

// Helper function to format dates properly in UTC
// const formatDateForAPI = (date: Date, isStartDate: boolean = true): string => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');

//     if (isStartDate) {
//         // Start of day in UTC: 00:00:00.000Z
//         return `${year}-${month}-${day}T00:00:00.000Z`;
//     } else {
//         // End of day in UTC: 23:59:59.999Z
//         return `${year}-${month}-${day}T23:59:59.999Z`;
//     }
// };

export const providerService = {
  getDashboardProvider: async (
    params?: DashboardQueryParams
  ): Promise<ProviderDashboardResponseType> => {
    let url = '/providers/dashboard';

    if (params) {
      // Validate params using the schema
      const validatedParams = dashboardQuerySchema.parse(params);

      // Build query string
      const queryParams = new URLSearchParams();

      // if (validatedParams.startDate) {
      //     queryParams.append('startDate', formatDateForAPI(validatedParams.startDate, true));
      // }

      // if (validatedParams.endDate) {
      //     queryParams.append('endDate', formatDateForAPI(validatedParams.endDate, false));
      // }

      if (validatedParams.granularity) {
        queryParams.append('granularity', validatedParams.granularity);
      }

      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    console.log('URL: ', url);

    const response = await apiService.get<ProviderDashboardResponseType>(url);
    return response.data;
  },
};
