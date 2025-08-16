import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Category } from '@/lib/api/services/fetchCategory';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryCardProps {
  category: Category;
  size?: 'sm' | 'md';
  onHover?: (categoryId: number | null) => void;
  onClick?: (category: Category) => void;
}

export function CategoryCard({ category, size = 'md', onHover, onClick }: CategoryCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleMouseEnter = () => {
    onHover?.(category.id);
  };

  const handleMouseLeave = () => {
    onHover?.(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!onClick) return;
    e.preventDefault();
    onClick(category);
  };

  return (
    <div
      className="overflow-hidden transition-all duration-300 flex flex-col cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
      aria-label={category.name}
    >
      <div className="relative aspect-square size-full mb-2 group">
        {isImageLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl" />
        )}
        {category.logo ? (
          <Image
            src={category.logo}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              'object-contain rounded-2xl transition-opacity duration-300 p-6 bg-muted',
              isImageLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={() => setIsImageLoading(false)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <span className={cn('text-sm', size === 'sm' && 'text-xs')}>Không có hình ảnh</span>
          </div>
        )}
      </div>
      <div className="px-1">
        <div className="flex justify-between items-center mb-1">
          <h3
            className={cn('text-base font-medium truncate', size === 'sm' && 'text-sm')}
            title={category.name}
          >
            {category.name}
          </h3>
        </div>
        {category.parentCategory && (
          <div
            className={cn('text-xs text-muted-foreground truncate', size === 'sm' && 'text-[11px]')}
          >
            Thuộc: {category.parentCategory.name}
          </div>
        )}
      </div>
    </div>
  );
}

export function CategoryCardSkeleton({ size = 'md' as const }: { size?: 'sm' | 'md' }) {
  return (
    <div className="overflow-hidden transition-all duration-300 flex flex-col">
      <div className="relative aspect-square size-full mb-2">
        <Skeleton className="absolute inset-0 rounded-2xl" />
      </div>
      <div className="px-1">
        <div className="flex justify-between items-center mb-1">
          <Skeleton className={cn('h-5 w-40', size === 'sm' && 'h-4 w-32')} />
        </div>
        <Skeleton className={cn('h-4 w-28', size === 'sm' && 'h-3 w-24')} />
      </div>
    </div>
  );
}
