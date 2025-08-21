import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import fetchAssets, {
  Asset,
  AssetCreateRequest,
  AssetUpdateRequest,
  AssetsListResponse,
  AssetResponse,
} from '@/lib/api/services/fetchAssets';
import { toast } from 'sonner';

const ASSETS_QUERY_KEY = ['assets'];

export function useAssetsList(customerId: number, options?: { enabled?: boolean }) {
  const query = useQuery<AssetsListResponse, unknown>({
    queryKey: [...ASSETS_QUERY_KEY, customerId],
    queryFn: () => fetchAssets.list(customerId),
    enabled: options?.enabled !== undefined ? options.enabled : !!customerId,
  });

  // Ensure assets is always an array
  const rawData = query.data?.data;
  const assets: Asset[] = Array.isArray(rawData) ? rawData : [];

  return { ...query, assets };
}

export function useCreateAsset() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<
    AssetResponse,
    unknown,
    { customerId: number; payload: AssetCreateRequest }
  >({
    mutationFn: ({ customerId, payload }) => fetchAssets.create(customerId, payload),
    onSuccess: () => {
      toast.success('Tạo thiết bị thành công');
      queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Tạo thiết bị thất bại';
      toast.error(message);
    },
  });

  const createAsset = useCallback(
    (customerId: number, payload: AssetCreateRequest) => mutateAsync({ customerId, payload }),
    [mutateAsync]
  );

  return { createAsset, isLoading: isPending };
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<
    AssetResponse,
    unknown,
    { id: number; payload: AssetUpdateRequest }
  >({
    mutationFn: ({ id, payload }) => fetchAssets.update(id, payload),
    onSuccess: () => {
      toast.success('Cập nhật thiết bị thành công');
      queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Cập nhật thiết bị thất bại';
      toast.error(message);
    },
  });

  const updateAsset = useCallback(
    (id: number, payload: AssetUpdateRequest) => mutateAsync({ id, payload }),
    [mutateAsync]
  );

  return { updateAsset, isLoading: isPending };
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation<{ message?: string }, unknown, number>({
    mutationFn: (id: number) => fetchAssets.remove(id),
    onSuccess: () => {
      toast.success('Xóa thiết bị thành công');
      queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Xóa thiết bị thất bại';
      toast.error(message);
    },
  });

  const deleteAsset = useCallback((id: number) => mutateAsync(id), [mutateAsync]);

  return { deleteAsset, isLoading: isPending };
}
