import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/lib/api/services/fetchStaff';
import type {
  CreateStaffReponse,
  CreateStaffRequest,
  StaffSearchParams,
} from '@/lib/api/services/fetchStaff';
import { toast } from 'sonner';
import { ValidationError } from '@/lib/api/services/fetchAuth';

export function useGetAllStaffs(filters?: StaffSearchParams) {
  return useQuery({
    queryKey: ['staffs', 'list', filters ? JSON.stringify(filters) : 'all'],
    queryFn: () => staffService.getAllStaff(filters),
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation<CreateStaffReponse, Error, CreateStaffRequest>({
    mutationFn: async (staff: CreateStaffRequest) => {
      const response = await staffService.createStaff(staff);
      return response;
    },
    onSuccess: () => {
      toast.success('Tạo nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: ['staffs'] });
    },
    onError: (error: unknown) => {
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
}
