import { ColumnDef } from '@tanstack/react-table';
import { Category } from '@/lib/api/services/fetchCategory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, FolderTree } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CategoryTableColumnsProps {
  onEdit: (category: Category) => void;
}

export function useCategoryTableColumns({
  onEdit,
}: CategoryTableColumnsProps): ColumnDef<Category>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Tên danh mục',
      cell: ({ row }) => {
        const category = row.original;
        const logoUrl =
          category.logo && category.logo.startsWith('http') ? category.logo : undefined;

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {logoUrl && <AvatarImage src={logoUrl} alt={category.name} />}
              <AvatarFallback className="bg-primary/10">
                {category.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{category.name}</span>
            </div>
          </div>
        );
      },
      enableHiding: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'parentCategory',
      header: 'Danh mục tổng',
      cell: ({ row }) => {
        const parentCategory = row.original.parentCategory;
        return parentCategory ? (
          <div className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary" className="font-normal">
              {parentCategory.name}
            </Badge>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            Không có
          </span>
        );
      },
      enableHiding: true,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(category)}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}
