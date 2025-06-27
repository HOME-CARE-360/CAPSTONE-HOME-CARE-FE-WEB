import { ColumnDef } from '@tanstack/react-table';
import { Category } from '@/lib/api/services/fetchCategory';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface CategoryTableColumnsProps {
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
}

export const useCategoryTableColumns = ({
  onEdit,
  onDelete,
}: CategoryTableColumnsProps = {}): ColumnDef<Category>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Tên danh mục',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Image
            src={'https://github.com/shadcn.png'}
            alt={row.original.name}
            width={40}
            height={40}
            className="h-8 w-8 rounded-full object-cover"
          />
          {row.original.logo && (
            <Image
              src={'https://github.com/shadcn.png'}
              alt={row.original.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'parentCategory',
      header: 'Danh mục cha',
      cell: ({ row }) => {
        const parentCategory = row.original.parentCategory;
        return parentCategory ? (
          <Badge variant="secondary">{parentCategory.name}</Badge>
        ) : (
          <span className="text-muted-foreground">Không có</span>
        );
      },
    },
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">#{row.original.id}</span>,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit && onEdit(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete && onDelete(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
};
