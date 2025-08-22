import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import userService, {
  CustomerBooking,
  GetUserInformationResponse,
  UpdateBankAccountRequest,
  AddOrRemoveFavoriteResponse,
  UpdateUserProposalRequest,
  UpdateUserProposalResponse,
  CancelServiceRequestResponse,
  GetUserReviewsResponse,
  UserReviewsSearchParams,
} from '@/lib/api/services/fetchUser';
import {
  UpdateUserProfileRequestType,
  UpdateUserProfileResponseType,
  ChangePasswordRequestType,
} from '@/schemaValidations/user.schema';
import { toast } from 'sonner';
import { ValidationError } from '@/lib/api/services/fetchAuth';

/**
 * Hook to fetch current user's profile
 */
export function useUserProfile() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: () => userService.getUserProfile(),
    enabled: isAuthenticated,
    // select: (data: GetProfileResponse) => ({
    //   profile: data.data,
    //   message: data.message,
    // }),
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: UpdateUserProfileRequestType) =>
      userService.updateUserProfile(profileData),
    onSuccess: (data: UpdateUserProfileResponseType) => {
      if (data.message) {
        queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
      }
    },
  });
}

export function useGetUserInformation(userId: string | number) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return useQuery({
    queryKey: ['users', 'information', userId],
    queryFn: () => userService.getUserInformation(userId),
    enabled: isAuthenticated,
    select: (data: GetUserInformationResponse) => ({
      profile: data.data,
      message: data.message,
    }),
  });
}

// export const useGetProviderInfomation = (providerId: string | number) => {
//   const isAuthenticated = useAuthStore(state => state.isAuthenticated);

//   return useQuery({
//     queryKey: ['providers', 'infomation', providerId],
//     queryFn: () => userService.getProviderInfomation(providerId),
//     enabled: isAuthenticated,
//     // select: (data: GetUserInformationResponse) => ({
//     //   profile: data.data,
//     //   message: data.message,
//     // }),
//   });
// };

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (passwordData: ChangePasswordRequestType) =>
      userService.changePassword(passwordData),
    onSuccess: () => {
      // Invalidate user profile to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });

      // Show success toast
      toast.success('Cập nhật mật khẩu thành công!');
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: Error | ValidationError) => {
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
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBankAccountRequest) => userService.updateBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
    },
    onError: (error: Error | ValidationError) => {
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
};

export const useCustomerBooking = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return useQuery({
    queryKey: ['users', 'booking'],
    queryFn: () => userService.getCustomerBooking(),
    enabled: isAuthenticated,
    select: (data: CustomerBooking) => ({
      bookings: Array.isArray(data.data.bookings) ? data.data.bookings : [data.data.bookings],
      message: data.message,
    }),
  });
};

export const useGetFavorite = () => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return useQuery({
    queryKey: ['users', 'favorite'],
    queryFn: () => userService.getFavorite(),
    enabled: isAuthenticated,
  });
};

export const useAddOrRemoveFavorite = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: (serviceId: number) => {
      if (!isAuthenticated) {
        throw new Error('Authentication required');
      }
      return userService.addOrRemoveFavorite(serviceId);
    },
    onSuccess: (data: AddOrRemoveFavoriteResponse) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'favorite'] });
      toast.success(data.message);
    },
    onError: (error: Error | ValidationError) => {
      if (error instanceof Error && error.message === 'Authentication required') {
        toast.error('Bạn cần đăng nhập để sử dụng tính năng này');
        return;
      }

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
};

export const useGetServiceProviderInformation = (providerId: number) => {
  return useQuery({
    queryKey: ['providers', 'information', providerId],
    queryFn: () => userService.getServiceProviderInformation(providerId),
    enabled: !!providerId && !isNaN(providerId),
  });
};

export const useGetUserProposal = (id: number) => {
  return useQuery({
    queryKey: ['users', 'proposal', id],
    queryFn: () => userService.getUserProposal(id),
    enabled: !!id && !isNaN(id),
  });
};

export const useUpdateUserProposal = () => {
  return useMutation<
    UpdateUserProposalResponse,
    Error | ValidationError,
    { id: number; data: UpdateUserProposalRequest }
  >({
    mutationFn: ({ id, data }) => userService.updateUserProposal(id, data),
    onSuccess: (data: UpdateUserProposalResponse) => {
      toast.success(data.message);
    },
    onError: (error: Error | ValidationError) => {
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
};

export const useGetUserReviews = (filters?: Partial<UserReviewsSearchParams>) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return useQuery<GetUserReviewsResponse>({
    queryKey: ['users', 'reviews', filters],
    queryFn: () => userService.getUserReviews(filters as UserReviewsSearchParams | undefined),
    enabled: isAuthenticated,
    select: data => data, // preserve new nested structure
  });
};

export const useDeleteUserReview = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, { reviewId: number }>({
    mutationFn: ({ reviewId }) => userService.deleteUserReview(reviewId),
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: ['users', 'reviews'] });
      toast.success(res.message || 'Xóa đánh giá thành công');
    },
    onError: (error: Error) => {
      let errorMessage = 'An unexpected error occurred';
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorObj = error as { message: string };
        errorMessage = errorObj.message || errorMessage;
      }
      toast.error(errorMessage);
    },
  });
};

export const useCancelServiceRequest = () => {
  return useMutation<
    CancelServiceRequestResponse,
    Error | ValidationError,
    { serviceRequestId: number }
  >({
    mutationFn: ({ serviceRequestId }) => userService.cancelServiceRequest(serviceRequestId),
    onSuccess: data => {
      toast.success(data.message || 'Đã hủy yêu cầu dịch vụ');
    },
    onError: (error: unknown) => {
      let errorMessage = 'An unexpected error occurred';

      // Handle error shape from backend
      if (typeof error === 'object' && error !== null && 'message' in error && 'error' in error) {
        // error from backend
        const err = error as {
          statusCode?: number;
          error?: string;
          message?: { message?: string; path?: string[] } | string;
          details?: Record<string, unknown>;
        };

        if (typeof err.message === 'object' && err.message && 'message' in err.message) {
          // Nested message object
          errorMessage =
            (err.message as { message?: string }).message ||
            (typeof err.error === 'string' ? err.error : errorMessage);
        } else if (typeof err.message === 'string') {
          errorMessage = err.message;
        } else if (typeof err.error === 'string') {
          errorMessage = err.error;
        }
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        // fallback for ValidationError or Error
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
};

export const useGetTopDiscountedServices = () => {
  return useQuery({
    queryKey: ['publics', 'top-discounted-services'],
    queryFn: () => userService.getTopDiscountedServices(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetTopProvidersAllTime = () => {
  return useQuery({
    queryKey: ['publics', 'top-providers-all-time'],
    queryFn: () => userService.getTopProvidersAllTime(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetTopFavoriteServices = () => {
  return useQuery({
    queryKey: ['publics', 'top-favorite-services'],
    queryFn: () => userService.getTopFavoriteServices(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
