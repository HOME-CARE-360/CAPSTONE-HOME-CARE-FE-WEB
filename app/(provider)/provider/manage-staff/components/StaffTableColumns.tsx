import { ColumnDef } from '@tanstack/react-table';
import { Staff } from '@/lib/api/services/fetchStaff';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface StaffTableColumnsProps {
  onEdit?: (staff: Staff) => void;
  onDelete?: (staff: Staff) => void;
}

export const useStaffTableColumns = ({
  onEdit,
  onDelete,
}: StaffTableColumnsProps = {}): ColumnDef<Staff>[] => {
  return [
    {
      id: 'name',
      header: 'Tên',
      accessorFn: row => row.user.name,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.user.avatar && (
            <Image
              src={row.original.user.avatar}
              alt={row.original.user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <span>{row.original.user.name}</span>
        </div>
      ),
      enableHiding: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'user.email',
      header: 'Email',
    },
    {
      accessorKey: 'user.phone',
      header: 'Số điện thoại',
    },
    {
      accessorKey: 'staffCategories',
      header: 'Vai trò',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.staffCategories && row.original.staffCategories.length > 0 ? (
            row.original.staffCategories.map((category, index) => (
              <Badge key={index} variant="secondary">
                {category.category.name}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Chưa phân vai trò
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? 'default' : 'destructive'}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    // {
    //   accessorKey: 'createdAt',
    //   header: 'Ngày khởi tạo',
    //   cell: ({ row }) => {
    //     try {
    //       const createdAt = row.original.createdAt;
    //       if (!createdAt) {
    //         return <span className="text-muted-foreground">Không có dữ liệu</span>;
    //       }

    //       const date = new Date(createdAt);
    //       if (isNaN(date.getTime())) {
    //         return <span className="text-muted-foreground">Ngày không hợp lệ</span>;
    //       }

    //       return format(date, 'MMM dd, yyyy');
    //     } catch (error) {
    //       return <span className="text-muted-foreground">Lỗi định dạng ngày</span>;
    //     }
    //   },
    // },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit && onEdit(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];
};
