import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import userService, {
  CustomerBooking,
  GetUserInformationResponse,
  UpdateBankAccountRequest,
  AddOrRemoveFavoriteResponse,
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

export function useGetUserInfomation(userId: string | number) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return useQuery({
    queryKey: ['users', 'infomation', userId],
    queryFn: () => userService.getUserInfomation(userId),
    enabled: isAuthenticated,
    select: (data: GetUserInformationResponse) => ({
      profile: data.data,
      message: data.message,
    }),
  });
}

export const useGetProviderInfomation = (providerId: string | number) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return useQuery({
    queryKey: ['providers', 'infomation', providerId],
    queryFn: () => userService.getProviderInfomation(providerId),
    enabled: isAuthenticated,
    // select: (data: GetUserInformationResponse) => ({
    //   profile: data.data,
    //   message: data.message,
    // }),
  });
};

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
      bookings: data.data.bookings,
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

  return useMutation({
    mutationFn: (serviceId: number) => userService.addOrRemoveFavorite(serviceId),
    onSuccess: (data: AddOrRemoveFavoriteResponse) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'favorite'] });
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
