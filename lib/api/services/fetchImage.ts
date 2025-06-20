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
      const s3Response = await apiService.put(response.data.presignedUrl, {
        file,
      });

      if (s3Response.status !== 200) {
        throw new Error('Failed to upload file to S3');
      }

      return response.data;
    } catch (error) {
      console.error('Upload Image Error:', error);
      throw error;
    }
  },
};
