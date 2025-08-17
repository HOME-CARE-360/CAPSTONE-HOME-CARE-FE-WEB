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
      onKeyDown={e => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(category);
        }
      }}
    >
      <div
        className={cn(
          'relative w-full mb-2 group',
          size === 'sm' ? 'h-32 md:h-36' : 'h-40 md:h-44 lg:h-48'
        )}
      >
        {isImageLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse rounded-2xl" aria-hidden="true" />
        )}
        {category.logo ? (
          <Image
            src={category.logo}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className={cn(
              'object-cover rounded-2xl transition-opacity duration-300 bg-muted',
              isImageLoading ? 'opacity-0' : 'opacity-100'
            )}
            loading="lazy"
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
            className={cn('font-medium truncate', size === 'sm' ? 'text-sm' : 'text-base')}
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
