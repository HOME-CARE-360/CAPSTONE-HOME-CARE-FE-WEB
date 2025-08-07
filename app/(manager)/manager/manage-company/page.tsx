'use client';

import { useState, useMemo } from 'react';
import { useGetListProvider } from '@/hooks/useManager';
import { Company, CompanyType, VerificationStatus } from '@/lib/api/services/fetchManager';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { SiteHeader } from '@/app/(manager)/components/SiteHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  FileText,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
  PaginationLink,
} from '@/components/ui/pagination';

export default function ManageCompanyPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>('');
  const [verificationFilter, setVerificationFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');

  // Fetch with filters and pagination
  const { data, isLoading, error, refetch } = useGetListProvider({
    page,
    limit: pageSize,
    name: globalFilter || undefined,
    companyType: companyTypeFilter as CompanyType | undefined,
    verificationStatus: verificationFilter as VerificationStatus | undefined,
  });

  // Pagination meta
  const totalPages = data?.pagination?.totalPages || 1;

  const columns: ColumnDef<Company>[] = useMemo(
    () => [
      {
        accessorKey: 'logo',
        header: 'Công ty',
        cell: ({ row }) => {
          const company = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={company.logo || ''} alt={company.description} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="font-medium">{company.description}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {company.address}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'companyType',
        header: 'Loại hình',
        cell: ({ row }) => {
          const type = row.getValue('companyType') as CompanyType;
          const typeLabels = {
            [CompanyType.SOLE_PROPRIETORSHIP]: 'Doanh nghiệp tư nhân',
            [CompanyType.LIMITED_LIABILITY]: 'Công ty TNHH',
            [CompanyType.JOINT_STOCK]: 'Công ty cổ phần',
            [CompanyType.PARTNERSHIP]: 'Công ty hợp danh',
            [CompanyType.OTHER]: 'Khác',
          };
          return (
            <Badge variant="outline" className="text-sm">
              {typeLabels[type] || type}
            </Badge>
          );
        },
      },
      //   {
      //     accessorKey: 'industry',
      //     header: 'Ngành nghề',
      //     cell: ({ row }) => {
      //       const industry = row.getValue('industry') as string;
      //       return (
      //         <div className="text-sm">
      //           {industry || <span className="text-muted-foreground">Chưa xác định</span>}
      //         </div>
      //       );
      //     },
      //   },
      {
        accessorKey: 'verificationStatus',
        header: 'Trạng thái',
        cell: ({ row }) => {
          const status = row.getValue('verificationStatus') as VerificationStatus;
          const statusConfig = {
            [VerificationStatus.PENDING]: {
              label: 'Chờ duyệt',
              variant: 'secondary' as const,
              icon: Clock,
            },
            [VerificationStatus.VERIFIED]: {
              label: 'Đã duyệt',
              variant: 'default' as const,
              icon: CheckCircle,
            },
            [VerificationStatus.REJECTED]: {
              label: 'Từ chối',
              variant: 'destructive' as const,
              icon: XCircle,
            },
          };
          const config = statusConfig[status];
          const Icon = config.icon;
          return (
            <Badge variant={config.variant} className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'licenseNo',
        header: 'Số giấy phép',
        cell: ({ row }) => {
          const license = row.getValue('licenseNo') as string;
          return (
            <div className="text-sm flex items-center gap-1">
              <FileText className="h-3 w-3 text-muted-foreground" />
              {license || <span className="text-muted-foreground">Chưa cung cấp</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'taxId',
        header: 'Mã số thuế',
        cell: ({ row }) => {
          const taxId = row.getValue('taxId') as string;
          return (
            <div className="text-sm font-mono">
              {taxId || <span className="text-muted-foreground">Chưa cung cấp</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Ngày tạo',
        cell: ({ row }) => {
          const date = row.getValue('createdAt') as string;
          return (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(date), 'dd/MM/yyyy', { locale: vi })}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Thao tác',
        cell: ({ row }) => {
          const company = row.original;
          if (company.verificationStatus !== VerificationStatus.PENDING) {
            return null;
          }
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Mở menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Duyệt
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <XCircle className="mr-2 h-4 w-4" />
                  Từ chối
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  // Loading skeleton (only cells, not header)
  if (isLoading) {
    return (
      <>
        <SiteHeader title="Quản lý công ty" />
        <div className="container mx-auto py-8">
          {/* Filters (interactive, not skeleton) */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative w-full md:w-1/3 flex">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm công ty..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setGlobalFilter(searchInput);
                    setPage(1);
                  }
                }}
                className="pl-10 pr-24"
              />
              <Button
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4"
                onClick={() => {
                  setGlobalFilter(searchInput);
                  setPage(1);
                }}
                variant="secondary"
                type="button"
              >
                Tìm kiếm
              </Button>
            </div>
            <Select
              value={companyTypeFilter || 'all'}
              onValueChange={v => {
                setCompanyTypeFilter(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Loại hình công ty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại hình</SelectItem>
                <SelectItem value={CompanyType.SOLE_PROPRIETORSHIP}>
                  Doanh nghiệp tư nhân
                </SelectItem>
                <SelectItem value={CompanyType.LIMITED_LIABILITY}>Công ty TNHH</SelectItem>
                <SelectItem value={CompanyType.JOINT_STOCK}>Công ty cổ phần</SelectItem>
                <SelectItem value={CompanyType.PARTNERSHIP}>Công ty hợp danh</SelectItem>
                <SelectItem value={CompanyType.OTHER}>Khác</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={verificationFilter || 'all'}
              onValueChange={v => {
                setVerificationFilter(v === 'all' ? '' : v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trạng thái xác minh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value={VerificationStatus.PENDING}>Chờ duyệt</SelectItem>
                <SelectItem value={VerificationStatus.VERIFIED}>Đã duyệt</SelectItem>
                <SelectItem value={VerificationStatus.REJECTED}>Từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setGlobalFilter('');
                setSearchInput('');
                setCompanyTypeFilter('');
                setVerificationFilter('');
                setPage(1);
              }}
              className="w-full md:w-auto"
            >
              Xóa bộ lọc
            </Button>
          </div>
          {/* Table skeleton (header, but only body is skeleton) */}
          <div className="rounded-xl border bg-white overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col, i) => (
                    <TableHead key={i} className="bg-muted/50 text-xs font-semibold uppercase">
                      {typeof col.header === 'string' ? col.header : ''}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j} className="text-sm">
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Pagination (centered, disabled) */}
          <div className="flex justify-center py-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" aria-disabled />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" aria-disabled />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SiteHeader title="Quản lý công ty" />
        <div className="container mx-auto py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Lỗi tải danh sách công ty</h3>
            <p className="text-muted-foreground text-center mb-4">
              {error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải danh sách công ty'}
            </p>
            <Button onClick={() => refetch()}>Thử lại</Button>
          </div>
        </div>
      </>
    );
  }

  // Pagination logic for max 5 page numbers, with ellipsis
  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    if (typeof range[0] === 'number' && range[0] > 1) range.unshift('...');
    const lastRangeItem = range[range.length - 1];
    if (typeof lastRangeItem === 'number' && lastRangeItem < totalPages) {
      range.push('...');
    }
    return range as (number | string)[];
  };

  return (
    <>
      <SiteHeader title="Quản lý công ty" />
      <div className="container mx-auto py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative w-full md:w-1/3 flex">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm công ty..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  setGlobalFilter(searchInput);
                  setPage(1);
                }
              }}
              className="pl-10 pr-24"
            />
            <Button
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4"
              onClick={() => {
                setGlobalFilter(searchInput);
                setPage(1);
              }}
              variant="secondary"
              type="button"
            >
              Tìm kiếm
            </Button>
          </div>
          <Select
            value={companyTypeFilter || 'all'}
            onValueChange={v => {
              setCompanyTypeFilter(v === 'all' ? '' : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Loại hình công ty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại hình</SelectItem>
              <SelectItem value={CompanyType.SOLE_PROPRIETORSHIP}>Doanh nghiệp tư nhân</SelectItem>
              <SelectItem value={CompanyType.LIMITED_LIABILITY}>Công ty TNHH</SelectItem>
              <SelectItem value={CompanyType.JOINT_STOCK}>Công ty cổ phần</SelectItem>
              <SelectItem value={CompanyType.PARTNERSHIP}>Công ty hợp danh</SelectItem>
              <SelectItem value={CompanyType.OTHER}>Khác</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={verificationFilter || 'all'}
            onValueChange={v => {
              setVerificationFilter(v === 'all' ? '' : v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Trạng thái xác minh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value={VerificationStatus.PENDING}>Chờ duyệt</SelectItem>
              <SelectItem value={VerificationStatus.VERIFIED}>Đã duyệt</SelectItem>
              <SelectItem value={VerificationStatus.REJECTED}>Từ chối</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setGlobalFilter('');
              setSearchInput('');
              setCompanyTypeFilter('');
              setVerificationFilter('');
              setPage(1);
            }}
            className="w-full md:w-auto"
          >
            Xóa bộ lọc
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-white overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className="bg-muted/50 text-xs font-semibold uppercase"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Không có công ty nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination (centered, improved) */}
        <div className="flex justify-center py-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                  aria-disabled={page === 1}
                />
              </PaginationItem>
              {getPaginationRange().map((p, idx) =>
                p === '...' ? (
                  <PaginationItem key={idx}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={page === p}
                      onClick={e => {
                        e.preventDefault();
                        setPage(Number(p));
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                  aria-disabled={page === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  );
}
