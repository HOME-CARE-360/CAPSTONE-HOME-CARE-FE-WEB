import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';
import userService, { GetUserInformationResponse } from '@/lib/api/services/fetchUser';
import {
  UpdateUserProfileRequestType,
  UpdateUserProfileResponseType,
} from '@/schemaValidations/user.schema';

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
