import { ColumnDef } from '@tanstack/react-table';
import { ServiceManager } from '@/lib/api/services/fetchServiceManager';
import { Currency, formatCurrency } from '@/utils/numbers/formatCurrency';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import Link from 'next/link';

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
        const categories = row.getValue('categories') as Array<{ id: number; name: string }>;
        return <div>{categories?.map(cat => cat.name).join(', ') || '--'}</div>;
      },
      enableHiding: true,
      filterFn: (row, id, value) => {
        if (value === 'all') return true;
        const categories = row.getValue(id) as Array<{ id: number; name: string }>;
        return categories?.some(cat => cat.name.includes(value)) || false;
      },
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div className="text-right">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/provider/manage-services/action?id=${service.id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return columns;
}
