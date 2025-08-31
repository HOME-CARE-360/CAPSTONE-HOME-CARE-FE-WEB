import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CreateBookingRequest,
  serviceBooking,
  StaffBookingResponse,
  StaffBookingDetailResponse,
  StaffInspectionDetailResponse,
  GetDetailBookingResponse,
  CreateReportRequest,
  CreateReportResponse,
  GetReportResponse,
  CreateReviewRequest,
  CreateReviewResponse,
  CompleteBookingRequest,
  CompleteBookingResponse,
  CancelServiceRequestRequest,
  CancelServiceRequestResponse,
  isBankTransferData,
  isWalletPaymentData,
} from '@/lib/api/services/fetchBooking';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api/core';
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

      const payload = response?.data;
      if (isBankTransferData(payload)) {
        const checkoutUrl = payload.checkoutUrl || payload.responseData?.checkoutUrl;
        if (checkoutUrl) {
          window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
          toast.info('Đang mở trang thanh toán...', {
            description: 'Vui lòng hoàn tất thanh toán để xác nhận đặt lịch',
            duration: 5000,
          });
        }
      } else if (isWalletPaymentData(payload)) {
        toast.success('Thanh toán bằng ví thành công');
      }

      router.push('/settings/bookings');
    },
    onError: (error: unknown) => {
      let errorMessage = 'An unexpected error occurred';

      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorObj = error as { message: string | ValidationError[] };

        if (Array.isArray(errorObj.message)) {
          const firstError = errorObj.message[0];

          if (firstError && typeof firstError === 'object' && 'error' in firstError) {
            const nestedError = firstError.error;

            if (nestedError && typeof nestedError === 'object' && 'message' in nestedError) {
              const nestedMessage = nestedError.message;

              if (Array.isArray(nestedMessage) && nestedMessage[0]?.message) {
                errorMessage = nestedMessage[0].message;
              } else if (typeof nestedMessage === 'string') {
                errorMessage = nestedMessage;
              } else {
                errorMessage = errorMessage; // Keep default message instead of firstError.message
              }
            } else {
              errorMessage = errorMessage; // Keep default message instead of firstError.message
            }
          } else {
            errorMessage = firstError?.message || errorMessage;
          }
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

export const useStaffBookingDetail = (bookingId: number, options?: { enabled?: boolean }) => {
  const { data, isLoading, error } = useQuery<StaffBookingDetailResponse>({
    queryKey: ['staff-booking-detail', bookingId],
    queryFn: () => serviceBooking.getStaffBookingDetail(bookingId),
    enabled: options?.enabled !== undefined ? options.enabled : !!bookingId,
  });

  return { data, isLoading, error };
};

export const useStaffInspectionDetail = (inspectionId: number, options?: { enabled?: boolean }) => {
  const { data, isLoading, error } = useQuery<StaffInspectionDetailResponse>({
    queryKey: ['staff-inspection-detail', inspectionId],
    queryFn: () => serviceBooking.getStaffInspectionDetail(inspectionId),
    enabled: options?.enabled !== undefined ? options.enabled : !!inspectionId,
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

export const useCreateReview = () => {
  const { data, isPending, error, mutate, mutateAsync } = useMutation<
    CreateReviewResponse,
    unknown,
    { bookingId: number; data: CreateReviewRequest }
  >({
    mutationFn: ({ bookingId, data }) => serviceBooking.createReview(bookingId, data),
    onSuccess: () => {
      toast.success('Gửi đánh giá thành công!');
    },
    onError: (err: unknown) => {
      // Shape may come from ApiService interceptor
      // Duplicate review patterns:
      // - error.error === 'This booking has already been reviewed.'
      // - error.message.message === 'Error.DuplicateReview'
      let userMessage = 'Đã xảy ra lỗi không mong muốn';

      if (typeof err === 'object' && err !== null) {
        type ApiErrMessage = string | { message?: string; path?: unknown };
        interface ApiErrShape {
          statusCode?: number;
          error?: string;
          message?: ApiErrMessage;
          details?: unknown;
        }
        const anyErr = err as ApiErrShape;

        const duplicateByError =
          typeof anyErr.error === 'string' && anyErr.error.includes('already been reviewed');
        const duplicateByCode =
          typeof anyErr.message === 'object' && anyErr.message?.message === 'Error.DuplicateReview';

        if (duplicateByError || duplicateByCode) {
          userMessage = 'Đã đánh giá dịch vụ này trước đó';
          toast.error(userMessage);
          return;
        }

        // Generic API error extraction
        if (typeof anyErr.message === 'string' || Array.isArray(anyErr.message as never)) {
          userMessage = getErrorMessage(anyErr as never);
          toast.error(userMessage);
          return;
        }
      }

      toast.error(userMessage);
    },
  });

  return { data, isPending, error, mutate, mutateAsync };
};

export const useCompleteBooking = () => {
  const { data, isPending, error, mutate, mutateAsync } = useMutation<
    CompleteBookingResponse,
    Error,
    CompleteBookingRequest
  >({
    mutationFn: (data: CompleteBookingRequest) => serviceBooking.completeBooking(data),
    onSuccess: () => {
      toast.success('Hoàn thành đơn hàng thành công!');
      window.location.reload();
    },
    onError: (error: Error) => {
      let errorMessage = 'Đã xảy ra lỗi không mong muốn';
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

export const useCancelServiceRequest = () => {
  const { data, isPending, error, mutate, mutateAsync } = useMutation<
    CancelServiceRequestResponse,
    Error,
    CancelServiceRequestRequest
  >({
    mutationFn: (data: CancelServiceRequestRequest) => serviceBooking.cancelServiceRequest(data),
    onSuccess: () => {
      toast.success('Hủy yêu cầu dịch vụ thành công!');
      window.location.reload();
    },
    onError: (error: Error) => {
      let errorMessage = 'Đã xảy ra lỗi không mong muốn';
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
