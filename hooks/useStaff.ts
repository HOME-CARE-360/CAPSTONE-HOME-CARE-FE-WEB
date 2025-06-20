import { useMutation, useQuery } from '@tanstack/react-query';
import { staffService } from '@/lib/api/services/fetchStaff';
import type { CreateStaffReponse, Staff } from '@/lib/api/services/fetchStaff';
import { StaffFormData } from '@/app/(provider)/provider/manage-staff/components/StaffCreateModal';

export function useGetAllStaffs() {
  return useQuery<Staff[]>({
    queryKey: ['staffs'],
    queryFn: async () => {
      try {
        const response = await staffService.getAllStaff();
        console.log('response', response);
        return response.data;
      } catch (error) {
        console.error('Error fetching staff:', error);
        throw error;
      }
    },
  });
}

export function useCreateStaff() {
  return useMutation<CreateStaffReponse, Error, StaffFormData>({
    mutationFn: async (staff: StaffFormData) => {
      const response = await staffService.createStaff(staff);
      return response;
    },
  });
}
