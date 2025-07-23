import apiService from '../core';

export interface ImageRequest {
  filename: string;
  filesize: number;
}

export interface ImageResponse {
  presignedUrl: string;
  url: string;
}

export const imageService = {
  uploadImage: async (file: File): Promise<ImageResponse> => {
    try {
      // Step 1: Get presigned URL
      const imageRequest = {
        filename: file.name,
        filesize: file.size,
      };

      const response = await apiService.post<ImageResponse, typeof imageRequest>(
        '/medias/images/upload/presigned-url',
        imageRequest
      );

      // Step 2: Upload file to S3 using presigned URL
      await apiService.uploadToS3<File>(response.data.presignedUrl, file);

      return response.data;
    } catch (error) {
      console.error('Upload Image Error:', error);
      throw error;
    }
  },
};
