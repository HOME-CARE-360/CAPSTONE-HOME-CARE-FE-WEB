import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  serviceManageBooking,
  GetBookingsParams,
  ManageBookingResponse,
  Booking,
  AssignStaffToBookingRequest,
} from '@/lib/api/services/fetchManageBooking';
import { useState, useMemo } from 'react';

// Main hook for fetching bookings with filters and pagination
export const useManageBookings = (params?: GetBookingsParams) => {
  const { data, isLoading, error, refetch } = useQuery<ManageBookingResponse>({
    queryKey: ['manage-bookings', params],
    queryFn: () => serviceManageBooking.getBookings(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return { data, isLoading, error, refetch };
};

// Hook for booking statistics and filtering
export const useBookingStats = (bookings?: Booking[]) => {
  const stats = useMemo(() => {
    if (!bookings) {
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        todayBookings: 0,
        thisWeekBookings: 0,
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'PENDING').length,
      confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
      inProgress: bookings.filter(b => b.status === 'IN_PROGRESS').length,
      completed: bookings.filter(b => b.status === 'COMPLETED').length,
      cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
      todayBookings: bookings.filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate >= today;
      }).length,
      thisWeekBookings: bookings.filter(b => {
        const bookingDate = new Date(b.createdAt);
        return bookingDate >= thisWeekStart;
      }).length,
    };
  }, [bookings]);

  return stats;
};

// Hook for managing booking filters and search
export const useBookingFilters = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  const params: GetBookingsParams = useMemo(
    () => ({
      page: currentPage,
      limit: 10,
      status: statusFilter,
      search: searchTerm,
    }),
    [currentPage, statusFilter, searchTerm]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
    setCurrentPage(1); // Reset to first page when date filtering
  };

  const resetFilters = () => {
    setCurrentPage(1);
    setStatusFilter('');
    setSearchTerm('');
    setDateRange({});
  };

  return {
    currentPage,
    statusFilter,
    searchTerm,
    dateRange,
    params,
    handlePageChange,
    handleStatusFilter,
    handleSearch,
    handleDateRangeChange,
    resetFilters,
  };
};

export const useAssignStaffToBooking = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: AssignStaffToBookingRequest) => serviceManageBooking.assignStaff(data),
    onSuccess: () => {
      // Invalidate and refetch booking data
      queryClient.invalidateQueries({ queryKey: ['manage-bookings'] });
    },
  });

  return { mutate, isPending, error };
};
