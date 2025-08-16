import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CreateBookingRequest,
  serviceBooking,
  StaffBookingResponse,
  GetDetailBookingResponse,
  CreateReportRequest,
  CreateReportResponse,
  GetReportResponse,
} from '@/lib/api/services/fetchBooking';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ValidationError } from '@/lib/api/services/fetchAuth';

export const useAllBookings = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => serviceBooking.getAllBookings(),
  });

  return { data, isLoading, error };
};

export const useDetailBooking = (id: number, options?: { enabled?: boolean }) => {
  const { data, isLoading, error } = useQuery<GetDetailBookingResponse, Error>({
    queryKey: ['booking-detail', id],
    queryFn: async () => {
      const response = await serviceBooking.getDetailBooking(id);
      // Type assertion to ensure runtime type safety
      if (typeof response !== 'object' || response === null) {
        throw new Error('Invalid booking detail response');
      }
      return response as GetDetailBookingResponse;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!id,
  });
  return { data, isLoading, error, id };
};

export const useCreateBooking = () => {
  const router = useRouter();
  const { data, isPending, error, mutate, mutateAsync } = useMutation({
    mutationFn: (data: CreateBookingRequest) => serviceBooking.createBooking(data),
    onSuccess: response => {
      toast.success('Đặt lịch thành công!');

      // If checkout URL is available, open it in a new tab
      if (response.data.responseData.checkoutUrl) {
        window.open(response.data.responseData.checkoutUrl, '_blank');
        toast.info('Đang mở trang thanh toán...', {
          description: 'Vui lòng hoàn tất thanh toán để xác nhận đặt lịch',
          duration: 3000,
        });
      }

      router.push('/settings/bookings');
    },
    onError: (error: Error) => {
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
      router.push('/settings/bookings');
    },
  });

  return { data, isPending, error, mutate, mutateAsync };
};

export const useStaffBooking = () => {
  const { data, isLoading, error } = useQuery<StaffBookingResponse>({
    queryKey: ['staff-bookings'],
    queryFn: () => serviceBooking.getStaffListBooking(),
  });

  return { data, isLoading, error };
};

export const useUpdateCompleteBookingOfUser = () => {
  const { data, isPending, error, mutate, mutateAsync } = useMutation<unknown, Error, number>({
    mutationFn: (bookingId: number) => serviceBooking.updateCompleteBookingOfUser(bookingId),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công!');
    },
    onError: (error: Error) => {
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

  return { data, isLoading: isPending, error, mutate, mutateAsync };
};

export const useCreateReport = () => {
  const { data, isPending, error, mutate, mutateAsync } = useMutation<
    CreateReportResponse,
    Error,
    { bookingId: number; data: CreateReportRequest }
  >({
    mutationFn: ({ bookingId, data }) => serviceBooking.createReport(bookingId, data),
    onSuccess: () => {
      toast.success('Tạo báo cáo thành công!');
    },
    onError: (error: Error) => {
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

  return { data, isPending, error, mutate, mutateAsync };
};

export const useGetReport = () => {
  const { data, isLoading, error } = useQuery<GetReportResponse>({
    queryKey: ['reports'],
    queryFn: () => serviceBooking.getReport(),
  });

  return { data, isLoading, error };
};
