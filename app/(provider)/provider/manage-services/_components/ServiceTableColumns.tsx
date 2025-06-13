import { ColumnDef } from '@tanstack/react-table';
import { Service } from '@/lib/api/services/fetchService';
import { Currency, formatCurrency } from '@/utils/numbers/formatCurrency';
import { Button } from '@/components/ui/button';

interface UseServiceTableColumnsProps {
  onEdit?: (service: Service) => void;
}

export function useServiceTableColumns({ onEdit }: UseServiceTableColumnsProps = {}) {
  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: 'name',
      header: () => 'Tên dịch vụ',
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
      enableHiding: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'basePrice',
      header: () => 'Giá tiền',
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
      header: () => 'Giá ảo',
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
      header: () => 'Khoảng thời gian',
      cell: ({ row }) => <div>{row.getValue('durationMinutes')} minutes</div>,
      enableHiding: true,
      filterFn: (row, id, value) => {
        const duration = parseFloat(row.getValue(id));
        return duration >= value;
      },
    },
    {
      accessorKey: 'provider',
      header: () => 'Nhà cung cấp',
      cell: ({ row }) => <div>{row.getValue('provider')}</div>,
      enableHiding: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'categories',
      header: () => 'Loại dịch vụ',
      cell: ({ row }) => {
        const categories = row.getValue('categories') as { name: string }[];
        return <div>{categories.map(cat => cat.name).join(', ')}</div>;
      },
      enableHiding: true,
      filterFn: (row, id, value) => {
        if (value === 'all') return true;
        const categories = row.getValue(id) as { name: string }[];
        return categories.some(cat => cat.name === value);
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const service = row.original;
        return (
          <Button variant="ghost" onClick={() => onEdit?.(service)}>
            Chỉnh sửa
          </Button>
        );
      },
    },
  ];

  return columns;
}
