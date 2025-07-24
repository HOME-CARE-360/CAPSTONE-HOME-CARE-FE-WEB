import { ColumnDef } from '@tanstack/react-table';
import { ServiceManager } from '@/lib/api/services/fetchServiceManager';
import { Currency, formatCurrency } from '@/utils/numbers/formatCurrency';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import Image from 'next/image';

interface ServiceTableColumnsProps {
  onEdit?: (service: ServiceManager) => void;
  onDelete?: (service: ServiceManager) => void;
}

export const useServiceTableColumns = ({
  onEdit,
  onDelete,
}: ServiceTableColumnsProps = {}): ColumnDef<ServiceManager>[] => {
  return [
    {
      accessorKey: 'images',
      header: 'Hình ảnh',
      cell: ({ row }) => {
        const images = row.original.images;
        if (!images || images.length === 0) {
          return <div className="text-muted-foreground">Chưa có ảnh</div>;
        }
        return (
          <Image
            src={images[0]}
            alt={row.original.name}
            width={64}
            height={64}
            className="h-24 w-24 rounded object-cover"
            unoptimized
          />
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: 'name',
      header: 'Tên dịch vụ',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
      enableHiding: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'basePrice',
      header: 'Giá tiền',
      cell: ({ row }) => {
        const price = parseFloat(row.getValue('basePrice'));
        return <div>{formatCurrency(price, Currency.VND)}</div>;
      },
      enableHiding: true,
      filterFn: (row, id, value) => {
        const price = parseFloat(row.getValue(id));
        return price >= value;
      },
    },
    {
      accessorKey: 'virtualPrice',
      header: 'Giá ảo',
      cell: ({ row }) => {
        const price = parseFloat(row.getValue('virtualPrice'));
        return <div>{formatCurrency(price, Currency.VND)}</div>;
      },
      enableHiding: true,
      filterFn: (row, id, value) => {
        const price = parseFloat(row.getValue(id));
        return price <= value;
      },
    },
    {
      accessorKey: 'durationMinutes',
      header: 'Thời gian (phút)',
      cell: ({ row }) => <div>{row.getValue('durationMinutes')}</div>,
      enableHiding: true,
      filterFn: (row, id, value) => {
        const duration = parseFloat(row.getValue(id));
        return duration >= value;
      },
    },
    {
      accessorKey: 'categories',
      header: 'Loại dịch vụ',
      cell: ({ row }) => {
        const category = row.original.category;
        return <div>{category?.name || '--'}</div>;
      },
      enableHiding: true,
      filterFn: (row, id, value) => {
        if (value === 'all') return true;
        const category = row.original.category;
        return category?.name?.includes(value) || false;
      },
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const status = row.original.status;
        let displayStatus = '--';
        if (status === 'PENDING') {
          displayStatus = 'Chờ duyệt';
        } else if (status === 'ACCEPTED') {
          displayStatus = 'Đã duyệt';
        } else if (status === 'REJECTED') {
          displayStatus = 'Từ chối';
        }
        return <div>{displayStatus}</div>;
      },
      enableHiding: true,
      filterFn: (row, id, value) => {
        if (value === 'all') return true;
        const status = row.original.status;
        return status === value;
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit && onEdit(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete && onDelete(row.original)}>
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
};
