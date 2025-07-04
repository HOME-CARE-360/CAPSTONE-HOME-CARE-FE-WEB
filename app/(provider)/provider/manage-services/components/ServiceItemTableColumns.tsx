import { ColumnDef } from '@tanstack/react-table';
import { ServiceItem } from '@/lib/api/services/fetchServiceManager';
import { Currency, formatCurrency } from '@/utils/numbers/formatCurrency';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { useDeleteServiceItem } from '@/hooks/useServiceManager';
import { ServiceItemSheet } from './ServiceItemSheet';
import { useMemo, useCallback } from 'react';

export function useServiceItemTableColumns() {
  const { mutate: deleteServiceItem } = useDeleteServiceItem();

  const handleDelete = useCallback(
    (id: number) => {
      if (confirm('Bạn có chắc chắn muốn xóa vật tư này?')) {
        deleteServiceItem(id);
      }
    },
    [deleteServiceItem]
  );

  const columns: ColumnDef<ServiceItem>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Tên vật tư',
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        enableHiding: true,
        filterFn: 'includesString',
      },
      {
        accessorKey: 'brand',
        header: 'Thương hiệu',
        cell: ({ row }) => <div>{row.getValue('brand')}</div>,
        enableHiding: true,
        filterFn: 'includesString',
      },
      {
        accessorKey: 'model',
        header: 'Model',
        cell: ({ row }) => <div>{row.getValue('model')}</div>,
        enableHiding: true,
        filterFn: 'includesString',
      },
      {
        accessorKey: 'unitPrice',
        header: 'Giá đơn vị',
        cell: ({ row }) => {
          const price = parseFloat(row.getValue('unitPrice'));
          return <div>{formatCurrency(price, Currency.VND)}</div>;
        },
        enableHiding: true,
      },
      {
        accessorKey: 'stockQuantity',
        header: 'Số lượng tồn',
        cell: ({ row }) => <div>{row.getValue('stockQuantity')}</div>,
        enableHiding: true,
      },
      {
        accessorKey: 'warrantyPeriod',
        header: 'Bảo hành (tháng)',
        cell: ({ row }) => <div>{row.getValue('warrantyPeriod')}</div>,
        enableHiding: true,
      },
      {
        accessorKey: 'isActive',
        header: 'Trạng thái',
        cell: ({ row }) => {
          const isActive = row.getValue('isActive') as boolean;
          return (
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Hoạt động' : 'Tạm ngưng'}
            </Badge>
          );
        },
        enableHiding: true,
        filterFn: (row, id, value) => {
          if (value === 'all' || value === undefined) return true;
          const isActive = row.getValue(id) as boolean;
          return isActive === value;
        },
      },
      {
        accessorKey: 'description',
        header: 'Mô tả',
        cell: ({ row }) => {
          const description = row.getValue('description') as string;
          return (
            <div className="max-w-[200px] truncate" title={description}>
              {description}
            </div>
          );
        },
        enableHiding: true,
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => {
          const serviceItem = row.original;
          return (
            <div className="flex items-center gap-2">
              <ServiceItemSheet
                key={`edit-${serviceItem.id}`}
                serviceItemId={serviceItem.id}
                trigger={
                  <Button variant="ghost" size="icon" className="transition-colors duration-150">
                    <Edit className="h-4 w-4" />
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(serviceItem.id)}
                className="text-destructive hover:text-destructive transition-colors duration-150"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [handleDelete]
  );

  return columns;
}
