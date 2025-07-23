'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { X } from 'lucide-react';

export interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string[]) => void;
  onUpload: (file: File) => Promise<string>;
  value: string[];
  className?: string;
  children?: React.ReactNode;
}

export function ImageUpload({
  disabled,
  onChange,
  onUpload,
  value,
  className,
  children,
}: ImageUploadProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        const uploadPromises = acceptedFiles.map(file => onUpload(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        onChange([...value, ...uploadedUrls]);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    },
    [onUpload, onChange, value]
  );

  const handleRemove = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpeg', '.jpg'],
    },
    disabled,
    maxFiles: 1,
  });

  return (
    <div className="space-y-4">
      {/* Display existing images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square rounded-lg overflow-hidden border border-input"
            >
              <Image
                src={url}
                alt={`Uploaded image ${index + 1}`}
                className="w-full h-full object-cover"
                width={100}
                height={100}
                unoptimized
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 rounded-md bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                  disabled={disabled}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        {...getRootProps()}
        className={cn(
          'relative cursor-pointer rounded-lg border border-dashed border-gray-900/25 transition-colors p-6',
          isDragActive && 'border-primary bg-primary/5',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <input {...getInputProps()} />
        {children || (
          <div className="flex flex-col items-center justify-center gap-1 text-center">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
}
