import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CreateBookingRequest,
  serviceBooking,
  StaffBookingResponse,
} from '@/lib/api/services/fetchBooking';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useAllBookings = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => serviceBooking.getAllBookings(),
  });

  return { data, isLoading, error };
};

export const useCreateBooking = () => {
  const router = useRouter();
  const { data, isPending, error, mutate, mutateAsync } = useMutation({
    mutationFn: (data: CreateBookingRequest) => serviceBooking.createBooking(data),
    onSuccess: () => {
      toast.success('Đặt lịch thành công!', {
        description: `Mã đặt lịch: BK${Date.now()}`,
        duration: 5000,
      });
      router.push('/');
    },
    onError: (error: Error) => {
      toast.error('Đặt lịch thất bại!', {
        description: error.message || 'Có lỗi xảy ra. Vui lòng thử lại!',
        duration: 5000,
      });
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
