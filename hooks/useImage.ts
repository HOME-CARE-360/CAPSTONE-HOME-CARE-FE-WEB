import { useMutation } from '@tanstack/react-query';
import { ImageResponse, imageService } from '@/lib/api/services/fetchImage';
import { toast } from 'sonner';

export const useUploadImage = () => {
  return useMutation({
    mutationFn: (file: File) => imageService.uploadImage(file),
    onSuccess: (data: ImageResponse) => {
      toast.success('Đã tải lên ảnh thành công');
      return data;
    },
    onError: (error: string) => {
      toast.error('Tải lên ảnh thất bại');
      console.error('Upload error:', error);
    },
  });
};
