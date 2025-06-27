import { useQuery } from '@tanstack/react-query';
import { serviceBooking } from '@/lib/api/services/fetchBooking';

export const useAllBookings = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => serviceBooking.getAllBookings(),
  });

  return { data, isLoading, error };
};
