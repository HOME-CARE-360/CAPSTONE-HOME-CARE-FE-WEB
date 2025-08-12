'use client';

import { Category } from '@/lib/api/services/fetchCategory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers, Edit, Trash } from 'lucide-react';
import { useDeleteCategoryById } from '@/hooks/useCategory';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Image from 'next/image';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
}

export function CategoryCard({ category, onEdit }: CategoryCardProps) {
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategoryById();

  const handleDelete = () => {
    deleteCategory(category.id);
  };

  return (
    <div className="overflow-hidden transition-all duration-300 flex flex-col">
      {/* Header image/logo section */}
      <div className="relative aspect-square size-full mb-2 group">
        {category.logo ? (
          <Image
            src={category.logo}
            alt={`Logo của ${category.name}`}
            className="absolute inset-0 w-full h-full object-cover rounded-xl object-center"
            loading="lazy"
            aria-label={`Logo của ${category.name}`}
            width={100}
            height={100}
          />
        ) : (
          <div className="relative w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
            <Layers className="h-16 w-16 text-gray-400" />
          </div>
        )}
        {/* Badges overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-green-500 backdrop-blur-sm z-10">Danh mục</Badge>
          {category.parentCategory?.name && (
            <Badge className="bg-green-500 backdrop-blur-sm z-10">
              {category.parentCategory.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-1">
        <div className="mb-2">
          <h3 className="text-base font-medium line-clamp-2">{category.name}</h3>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(category)}
            disabled={isDeleting}
            className="flex-1 border-gray-300 text-black hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Sửa
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting} className="flex-1">
                <Trash className="h-4 w-4 mr-2" />
                {isDeleting ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa danh mục {category.name}? Hành động này không thể hoàn
                  tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
