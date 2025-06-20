import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useAuthStore } from '@/lib/store/authStore';
import userService, { User, UserResponse, UserUpdateResponse } from '@/lib/api/services/fetchUser';

/**
 * Hook to fetch current user's profile
 */
export function useUserProfile() {
  // const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return useQuery({
    queryKey: ['users', 'profile'],
    queryFn: () => userService.getUserProfile(),
    // enabled: isAuthenticated,
    select: (data: UserResponse) => ({
      profile: data.data,
      message: data.message,
    }),
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: Partial<User> | FormData) =>
      userService.updateUserProfile(profileData),
    onSuccess: (data: UserUpdateResponse) => {
      if (data.message) {
        queryClient.invalidateQueries({ queryKey: ['users', 'profile'] });
      }
    },
  });
}
