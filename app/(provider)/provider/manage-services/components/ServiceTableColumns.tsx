import { ColumnDef } from '@tanstack/react-table';
import { ServiceManager } from '@/lib/api/services/fetchServiceManager';
import { Currency, formatCurrency } from '@/utils/numbers/formatCurrency';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { ServiceSheet } from './ServiceSheet';

export function useServiceTableColumns() {
  const columns: ColumnDef<ServiceManager>[] = [
    {
      accessorKey: 'name',
      header: 'Tên dịch vụ',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
      enableHiding: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }) => <div>{row.getValue('description')}</div>,
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
        const category = row.getValue('categories') as { id: number; name: string };
        return <div>{category?.name || '--'}</div>;
      },
      enableHiding: true,
      filterFn: (row, id, value) => {
        if (value === 'all') return true;
        const category = row.getValue(id) as { id: number; name: string };
        return category?.name?.includes(value) || false;
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div className="text-right">
            <ServiceSheet
              serviceId={service.id}
              trigger={
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        );
      },
    },
  ];

  return columns;
}
