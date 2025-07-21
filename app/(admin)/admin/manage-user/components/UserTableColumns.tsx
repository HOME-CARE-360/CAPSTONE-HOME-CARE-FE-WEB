import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { UserResponseType } from '@/schemaValidations/admin.schema';
import { formatToVietnamTime } from '@/utils/helper';

interface UserTableColumnsProps {
  onEdit?: (user: UserResponseType) => void;
  onDelete?: (user: UserResponseType) => void;
}

export const useUserTableColumns = ({
  onEdit,
  onDelete,
}: UserTableColumnsProps = {}): ColumnDef<UserResponseType>[] => {
  return [
    {
      id: 'name',
      header: 'Tên',
      accessorFn: row => row.name,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.avatar && (
            <Image
              src={row.original.avatar}
              alt={row.original.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}
          <span>{row.original.name}</span>
        </div>
      ),
      enableHiding: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'phone',
      header: 'Số điện thoại',
    },
    {
      accessorKey: 'roles',
      header: 'Vai trò',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((role, index) => (
            <Badge key={index} variant="secondary">
              {role.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'destructive'}>
          {row.original.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày khởi tạo',
      cell: ({ row }) => formatToVietnamTime(row.original.createdAt),
    },
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
