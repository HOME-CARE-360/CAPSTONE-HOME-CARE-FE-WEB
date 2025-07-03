'use client';

import { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DroppableStateSnapshot,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { ImageUpload } from '@/components/ui/image-upload';
import { X, GripVertical, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface DraggableImageUploadProps {
  images: string[];
  onImagesChange: (urls: string[]) => void;
  onImageUpload: (file: File) => Promise<string>;
  maxImages?: number;
}

const reorder = (list: string[], startIndex: number, endIndex: number): string[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export function DraggableImageUpload({
  images,
  onImagesChange,
  onImageUpload,
  maxImages = 10,
}: DraggableImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);

    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    // If the item was dropped in the same position
    if (result.destination.index === result.source.index) {
      return;
    }

    const newOrder = reorder(images, result.source.index, result.destination.index);

    onImagesChange(newOrder);
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Droppable droppableId="images" direction="horizontal">
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={cn(
                'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[200px] rounded-lg',
                snapshot.isDraggingOver && 'bg-muted/50',
                isDragging && 'ring-2 ring-primary/20'
              )}
            >
              {images.map((url, index) => (
                <Draggable key={url} draggableId={url} index={index}>
                  {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        'relative group aspect-square rounded-lg overflow-hidden border border-input transition-all duration-200',
                        snapshot.isDragging && 'ring-2 ring-primary shadow-lg scale-105',
                        !snapshot.isDragging && 'hover:ring-2 hover:ring-primary/50'
                      )}
                    >
                      {/* Image */}
                      <Image
                        src={url}
                        alt={`Uploaded image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        width={100}
                        height={100}
                        priority
                        unoptimized
                      />

                      {/* Overlay with actions */}
                      <div
                        className={cn(
                          'absolute inset-0 bg-black/40 transition-opacity duration-200 flex items-center justify-center',
                          snapshot.isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        )}
                      >
                        {/* Drag handle */}
                        <div
                          {...provided.dragHandleProps}
                          className={cn(
                            'absolute top-2 left-2 p-1.5 rounded-md bg-black/50 text-white cursor-grab',
                            snapshot.isDragging && 'cursor-grabbing'
                          )}
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-white hover:bg-red-500/50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Image number */}
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded-md">
                            Ảnh {index + 1} / {images.length}
                          </span>
                          {snapshot.isDragging && (
                            <span className="text-white/80 text-xs">Thả để sắp xếp</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Upload button */}
              {images.length < maxImages && (
                <div
                  className={cn(
                    'aspect-square rounded-lg transition-all duration-200',
                    isDragging && 'opacity-50'
                  )}
                >
                  <ImageUpload
                    value={[]}
                    onChange={urls => {
                      const newUrls = urls.filter(url => !images.includes(url));
                      if (newUrls.length > 0) {
                        onImagesChange([...images, ...newUrls.slice(0, maxImages - images.length)]);
                      }
                    }}
                    onUpload={onImageUpload}
                    className="w-full h-full"
                  >
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                      <ImagePlus className="w-8 h-8" />
                      <span className="text-sm font-medium">Tải lên ảnh</span>
                      <span className="text-xs">
                        {images.length} trên {maxImages} ảnh
                      </span>
                    </div>
                  </ImageUpload>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
