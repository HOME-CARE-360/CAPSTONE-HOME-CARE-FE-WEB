import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/lib/api/services/fetchStaff';
import type {
  CreateStaffReponse,
  CreateStaffRequest,
  StaffSearchParams,
  StaffCheckInResponse,
  CreateInspectionReportRequest,
  CreateInspectionReportResponse,
  StaffCheckoutResponse,
} from '@/lib/api/services/fetchStaff';
import { toast } from 'sonner';
import { ValidationError } from '@/lib/api/services/fetchAuth';

export function useGetAllStaffs(filters?: StaffSearchParams) {
  return useQuery({
    queryKey: ['staffs', 'list', filters ? JSON.stringify(filters) : 'all'],
    queryFn: () => staffService.getAllStaff(filters),
  });
}

export function useGetStaffAvailable(filters?: StaffSearchParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['staffs', 'list', filters ? JSON.stringify(filters) : 'all'],
    queryFn: () => staffService.getAllStaff(filters),
    enabled: options?.enabled !== undefined ? options.enabled : true,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation<CreateStaffReponse, Error, CreateStaffRequest>({
    mutationFn: async (staff: CreateStaffRequest) => {
      const response = await staffService.createStaff(staff);
      return response;
    },
    onSuccess: () => {
      toast.success('Tạo nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
    },
    onError: (error: unknown) => {
      let errorMessage = 'An unexpected error occurred';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorObj = error as { message: string | ValidationError[] };
        if (Array.isArray(errorObj.message)) {
          errorMessage = errorObj.message[0]?.message || errorMessage;
        } else if (typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        }
      }
      toast.error(errorMessage);
    },
  });
}

export function useStaffCheckIn() {
  const queryClient = useQueryClient();
  return useMutation<StaffCheckInResponse, Error, number>({
    mutationFn: async (bookingId: number) => {
      const response = await staffService.staffCheckIn(bookingId);
      return response;
    },
    onSuccess: () => {
      toast.success('Check-in thành công');
      queryClient.invalidateQueries({ queryKey: ['staff-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Có lỗi xảy ra khi check-in';

      if (typeof error === 'object' && error !== null) {
        if ('message' in error) {
          const errorObj = error as { message: string | ValidationError[] | { message: string } };

          if (typeof errorObj.message === 'object' && 'message' in errorObj.message) {
            // Handle structured error response
            const structuredMessage = errorObj.message as { message: string };
            if (structuredMessage.message === 'Error.DateMismatchPreferredDate') {
              errorMessage = 'Không thể check-in vào ngày khác với ngày hẹn';
            } else {
              errorMessage = structuredMessage.message;
            }
          } else if (Array.isArray(errorObj.message)) {
            errorMessage = errorObj.message[0]?.message || errorMessage;
          } else if (typeof errorObj.message === 'string') {
            errorMessage = errorObj.message;
          }
        }

        if ('error' in error && typeof error.error === 'string') {
          errorMessage = error.error;
        }
      }

      toast.error(errorMessage);
    },
  });
}

export function useCreateInspectionReport() {
  const queryClient = useQueryClient();
  return useMutation<CreateInspectionReportResponse, Error, CreateInspectionReportRequest>({
    mutationFn: async (data: CreateInspectionReportRequest) => {
      const response = await staffService.createInspectionReport(data);
      return response;
    },
    onSuccess: () => {
      toast.success('Tạo báo cáo khảo sát thành công');
      queryClient.invalidateQueries({ queryKey: ['staff-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['inspection-reports'] });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Có lỗi xảy ra khi tạo báo cáo khảo sát';

      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorObj = error as { message: string | ValidationError[] };
        if (Array.isArray(errorObj.message)) {
          errorMessage = errorObj.message[0]?.message || errorMessage;
        } else if (typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        }
      }

      toast.error(errorMessage);
    },
  });
}

export function useGetProposal(bookingId: number) {
  return useQuery({
    queryKey: ['staff-proposals', bookingId],
    queryFn: () => staffService.getProposal(bookingId),
    enabled: !!bookingId,
  });
}

export function useGetReview() {
  return useQuery({
    queryKey: ['staff-reviews'],
    queryFn: () => staffService.getReview(),
  });
}

export function useGetWorkLog() {
  return useQuery({
    queryKey: ['staff-work-logs'],
    queryFn: () => staffService.getWorkLog(),
  });
}

export function useGetMonthlyStats(month: string, year: number) {
  return useQuery({
    queryKey: ['staff-monthly-stats', month, year],
    queryFn: () => staffService.getMonthlyStats(month, year),
  });
}

export function useStaffCheckOut() {
  const queryClient = useQueryClient();
  return useMutation<
    StaffCheckoutResponse,
    Error,
    { bookingId: number; data: Record<string, unknown> }
  >({
    mutationFn: async ({ bookingId, data }) => {
      const response = await staffService.staffCheckOut(bookingId, data);
      return response;
    },
    onSuccess: () => {
      toast.success('Check out thành công');
      queryClient.invalidateQueries({ queryKey: ['staff-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: Error | ValidationError) => {
      let errorMessage = 'AlreadyCheckedOut';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorObj = error as { message: string | ValidationError[] };
        if (Array.isArray(errorObj.message)) {
          errorMessage = errorObj.message[0]?.message || errorMessage;
        } else if (typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        }
      }
      toast.error(errorMessage);
    },
  });
}
