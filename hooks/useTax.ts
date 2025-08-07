import { useQuery } from '@tanstack/react-query';
import { fetchTax } from '@/lib/api/services/fetchTax';
import { toast } from 'sonner';

export const useTax = (taxCode: string) => {
  return useQuery({
    queryKey: ['tax', taxCode],
    queryFn: async () => {
      const response = await fetchTax(taxCode);
      if (typeof response === 'object' && response !== null && 'code' in response) {
        if (response.code === '00') {
          toast.success(response.desc);
        } else {
          toast.error(response.desc);
        }
      } else {
        toast.error('Phản hồi không hợp lệ');
      }
      return response;
    },
  });
};
