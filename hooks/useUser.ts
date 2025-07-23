import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import userService, { GetUserInformationResponse } from '@/lib/api/services/fetchUser';
import {
  UpdateUserProfileRequestType,
  UpdateUserProfileResponseType,
  ChangePasswordRequestType,
} from '@/schemaValidations/user.schema';
import { toast } from 'sonner';

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
    onError: (error: any) => {
      // Handle error with toast notification
      console.error('Change password error:', error);

      let errorMessage = 'Đổi mật khẩu thất bại. Vui lòng thử lại!';

      // Handle the specific error structure you're getting
      if (error?.error) {
        errorMessage = error.error;
      } else if (error?.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.message[0]?.message || errorMessage;
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    },
  });
};
