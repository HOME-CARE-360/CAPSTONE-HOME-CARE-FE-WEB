import apiService from '@/lib/api/core';

export interface GetAllBookingsResponse<T> {
  data: T;
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const serviceBooking = {
  // createBooking: async (data: any) => {
  //     try {
  //         const response = await apiService.post(`/bookings/create-service-request`, data);
  //         return response.data;
  //       } catch (error) {
  //         console.error('Create Booking Service Error:', error);
  //         throw error;
  //       }
  // }

  getAllBookings: async () => {
    try {
      const response = await apiService.get(`/manage-bookings/list-service-request`);
      return response.data;
    } catch (error) {
      console.error('Get All Bookings Error:', error);
      throw error;
    }
  },
};
