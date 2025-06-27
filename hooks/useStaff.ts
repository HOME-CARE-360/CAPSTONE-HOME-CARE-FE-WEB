import { useMutation, useQuery } from '@tanstack/react-query';
import { staffService } from '@/lib/api/services/fetchStaff';
import type { CreateStaffReponse, StaffSearchParams } from '@/lib/api/services/fetchStaff';
import { StaffFormData } from '@/app/(provider)/provider/manage-staff/components/StaffCreateModal';

export function useGetAllStaffs(filters?: StaffSearchParams) {
  return useQuery({
    queryKey: ['staffs', 'list', filters ? JSON.stringify(filters) : 'all'],
    queryFn: () => staffService.getAllStaff(filters),
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
