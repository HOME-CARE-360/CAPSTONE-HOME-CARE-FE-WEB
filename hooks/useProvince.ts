import { useQuery } from '@tanstack/react-query';
import { provinceService, ProvincesResponse } from '@/lib/api/services/fetchProvinces';

export const useProvince = () => {
  const { data, isLoading, error } = useQuery<ProvincesResponse, Error>({
    queryKey: ['provinces'],
    queryFn: () => provinceService.getProvince(new Date().toISOString().slice(0, 10)),
  });

  return { data, isLoading, error };
};

export const useProvinceCommunes = (provinceID: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['province-communes', provinceID],
    queryFn: () =>
      provinceService.getProvinceCommunes(new Date().toISOString().slice(0, 10), provinceID),
  });

  return { data, isLoading, error };
};
