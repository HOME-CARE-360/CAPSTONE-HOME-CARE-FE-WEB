import { useQuery } from '@tanstack/react-query';
import { bankService } from '@/lib/api/services/fetchBank';

export const useBank = () => {
  return useQuery({
    queryKey: ['bank'],
    queryFn: bankService.getBankList,
  });
};
