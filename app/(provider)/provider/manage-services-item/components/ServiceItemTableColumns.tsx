import { ColumnDef } from '@tanstack/react-table';
import { ServiceItem } from '@/lib/api/services/fetchServiceItem';
import { Currency, formatCurrency } from '@/utils/numbers/formatCurrency';
import { Button } from '@/components/ui/button';
import { Edit, Eye } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export function useServiceItemTableColumns() {
  const columns: ColumnDef<ServiceItem>[] = [
    {
      accessorKey: 'name',
      header: 'Tên sản phẩm',
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
      header: 'Giá bán',
      cell: ({ row }) => {
        const price = parseFloat(row.getValue('unitPrice'));
        return <div className="font-medium">{formatCurrency(price, Currency.VND)}</div>;
      },
      enableHiding: true,
      filterFn: (row, id, value) => {
        const price = parseFloat(row.getValue(id));
        return price >= value;
      },
    },
    {
      accessorKey: 'stockQuantity',
      header: 'Tồn kho',
      cell: ({ row }) => {
        const quantity = row.getValue('stockQuantity') as number;
        return (
          <div
            className={`font-medium ${quantity === 0 ? 'text-red-600' : quantity < 5 ? 'text-orange-600' : 'text-green-600'}`}
          >
            {quantity}
          </div>
        );
      },
      enableHiding: true,
      filterFn: (row, id, value) => {
        const quantity = parseFloat(row.getValue(id));
        return quantity >= value;
      },
    },
    {
      accessorKey: 'warrantyPeriod',
      header: 'Bảo hành (tháng)',
      cell: ({ row }) => <div>{row.getValue('warrantyPeriod')}</div>,
      enableHiding: true,
      filterFn: (row, id, value) => {
        const warranty = parseFloat(row.getValue(id));
        return warranty >= value;
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Hoạt động' : 'Không hoạt động'}
          </Badge>
        );
      },
      enableHiding: true,
      filterFn: (row, id, value) => {
        const isActive = row.getValue(id) as boolean;
        if (value === 'all') return true;
        return isActive === (value === 'active');
      },
    },
    {
      accessorKey: 'images',
      header: 'Hình ảnh',
      cell: ({ row }) => {
        const images = row.getValue('images') as string[];
        return (
          <div className="flex gap-1">
            {images.slice(0, 2).map((image, index) => (
              <div key={index} className="w-8 h-8 rounded border overflow-hidden">
                <img
                  src={image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.src = 'https://via.placeholder.com/32x32?text=IMG';
                  }}
                />
              </div>
            ))}
            {images.length > 2 && (
              <div className="w-8 h-8 rounded border bg-muted flex items-center justify-center text-xs">
                +{images.length - 2}
              </div>
            )}
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
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/provider/manage-services-item/action?id=${serviceItem.id}`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/provider/manage-services-item/${serviceItem.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return columns;
}
