import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/react-table';
import { Service } from '@/lib/api/services/fetchService';
import { Currency, formatCurrency } from '@/utils/numbers/formatCurrency';
import { Button } from '@/components/ui/button';

interface UseServiceTableColumnsProps {
  onEdit?: (service: Service) => void;
}

export function useServiceTableColumns({ onEdit }: UseServiceTableColumnsProps = {}) {
  const { t } = useTranslation();

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: 'name',
      header: () => t('service.name'),
      cell: ({ row }) => <div>{row.getValue('name')}</div>,
      enableHiding: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'basePrice',
      header: () => t('service.base_price'),
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
      header: () => t('service.virtual_price'),
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
      header: () => t('service.duration'),
      cell: ({ row }) => <div>{row.getValue('durationMinutes')} minutes</div>,
      enableHiding: true,
      filterFn: (row, id, value) => {
        const duration = parseFloat(row.getValue(id));
        return duration >= value;
      },
    },
    {
      accessorKey: 'provider',
      header: () => t('service.provider'),
      cell: ({ row }) => <div>{row.getValue('provider')}</div>,
      enableHiding: true,
      filterFn: 'includesString',
    },
    {
      accessorKey: 'categories',
      header: () => t('service.categories'),
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
            {t('edit')}
          </Button>
        );
      },
    },
  ];

  return columns;
}
