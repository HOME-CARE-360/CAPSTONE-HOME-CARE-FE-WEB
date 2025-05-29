'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  GripVerticalIcon,
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { toast } from 'sonner';
import { z } from 'zod';

import { useIsMobile } from '@/hooks/useMobile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

function DragHandle({ id }: { id: string | number }) {
  const { attributes, listeners } = useSortable({ id });
  const { t } = useTranslation();

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">{t('drag_to_reorder')}</span>
    </Button>
  );
}

// Hàm render cho header của cột select
function SelectHeader<TData>({
  table,
  t,
}: {
  table: ReturnType<typeof useReactTable<TData>>;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label={t('select_all')}
      />
    </div>
  );
}

// Hàm render cho cell của cột select
function SelectCell<TData>({ row, t }: { row: Row<TData>; t: (key: string) => string }) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label={t('select_row')}
      />
    </div>
  );
}

// Hàm render cho cell của cột target
function TargetCell({
  row,
  t,
}: {
  row: Row<z.infer<typeof schema>>;
  t: (key: string, options?: Record<string, string>) => string;
}) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
          // loadingTechnique: t('saving', { header: row.original.header }),
          success: t('done_message'),
          error: t('error_message'),
        });
      }}
    >
      <Label htmlFor={`${row.original.id}-target`} className="sr-only">
        {t('target')}
      </Label>
      <Input
        className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
        defaultValue={row.original.target}
        id={`${row.original.id}-target`}
      />
    </form>
  );
}

function LimitCell({
  row,
  t,
}: {
  row: Row<z.infer<typeof schema>>;
  t: (key: string, options?: Record<string, string>) => string;
}) {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
          loading: t('saving', { header: row.original.header }),
          success: t('done_message'),
          error: t('error_message'),
        });
      }}
    >
      <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
        {t('limit')}
      </Label>
      <Input
        className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
        defaultValue={row.original.limit}
        id={`${row.original.id}-limit`}
      />
    </form>
  );
}

// Hàm render cho cell của cột reviewer
function ReviewerCell({
  row,
  t,
}: {
  row: Row<z.infer<typeof schema>>;
  t: (key: string) => string;
}) {
  const isAssigned = row.original.reviewer !== 'Assign reviewer';

  if (isAssigned) {
    return row.original.reviewer;
  }

  return (
    <>
      <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
        {t('reviewer')}
      </Label>
      <Select>
        <SelectTrigger className="h-8 w-40" id={`${row.original.id}-reviewer`}>
          <SelectValue placeholder={t('select_reviewer')} />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
          <SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}

// Hàm render cho cell của cột actions
function ActionsCell({ t }: { t: (key: string) => string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
        >
          <MoreVerticalIcon />
          <span className="sr-only">{t('open_menu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem>{t('edit')}</DropdownMenuItem>
        <DropdownMenuItem>{t('make_copy')}</DropdownMenuItem>
        <DropdownMenuItem>{t('favorite')}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>{t('delete')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns = (
  t: (key: string, options?: Record<string, string>) => string
): ColumnDef<z.infer<typeof schema>>[] => [
  {
    id: 'drag',
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: 'select',
    header: ({ table }) => <SelectHeader<z.infer<typeof schema>> table={table} t={t} />,
    cell: ({ row }) => <SelectCell<z.infer<typeof schema>> row={row} t={t} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'header',
    header: () => t('header.title'),
    cell: ({ row }) => <TableCellViewer item={row.original} />,
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: () => t('section_type'),
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: () => t('status'),
    cell: ({ row }) => (
      <Badge variant="outline" className="flex gap-1 px-1.5 text-muted-foreground [&_svg]:size-3">
        {row.original.status === 'Done' ? (
          <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
        ) : (
          <LoaderIcon />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'target',
    header: () => <div className="w-full text-right">{t('target')}</div>,
    cell: ({ row }) => <TargetCell row={row} t={t} />,
  },
  {
    accessorKey: 'limit',
    header: () => <div className="w-full text-right">{t('limit')}</div>,
    cell: ({ row }) => <LimitCell row={row} t={t} />,
  },
  {
    accessorKey: 'reviewer',
    header: () => t('reviewer'),
    cell: ({ row }) => <ReviewerCell row={row} t={t} />,
  },
  {
    id: 'actions',
    cell: () => <ActionsCell t={t} />,
  },
];

function DraggableRow<TData extends { id: string | number }>({ row }: { row: Row<TData> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map(cell => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export interface DataTableProps<TData extends { id: string | number }> {
  data: TData[];
  columns: (t: (key: string, options?: Record<string, string>) => string) => ColumnDef<TData>[];
  searchParams?: string;
  onFilterChange?: (params: string) => void;
  isLoading?: boolean;
  error?: Error | null;
  noResultsFoundMessage?: React.ReactNode;
}

export function DataTable<TData extends { id: string | number }>({
  data: initialData,
  columns,
  isLoading,
  error,
  noResultsFoundMessage,
}: DataTableProps<TData>) {
  const { t } = useTranslation();
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(item => String(item.id)) || [],
    [data]
  );

  const table = useReactTable({
    data,
    columns: columns(t), // Truyền hàm t vào columns
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: row => String(row.id),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData(data => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">{t('loading_data')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg border-destructive bg-destructive/10">
        <div className="flex flex-col items-center gap-2 text-center max-w-md p-6">
          <div className="text-lg font-medium text-destructive">{t('error_loading_data')}</div>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : t('error_loading_data')}
          </p>
        </div>
      </div>
    );
  }

  if (data.length === 0 && noResultsFoundMessage) {
    return <>{noResultsFoundMessage}</>;
  }

  return (
    <Tabs defaultValue="outline" className="flex w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          {t('view')}
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger className="md:hidden flex w-fit" id="view-selector">
            <SelectValue placeholder={t('select_view')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="outline">{t('outline')}</SelectItem>
            <SelectItem value="past-performance">{t('past_performance')}</SelectItem>
            <SelectItem value="key-personnel">{t('key_personnel')}</SelectItem>
            <SelectItem value="focus-documents">{t('focus_documents')}</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="md:flex hidden">
          <TabsTrigger value="outline">{t('outline')}</TabsTrigger>
          <TabsTrigger value="past-performance" className="gap-1">
            {t('past_performance')}{' '}
            <Badge
              variant="secondary"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
            >
              3
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="key-personnel" className="gap-1">
            {t('key_personnel')}{' '}
            <Badge
              variant="secondary"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
            >
              2
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="focus-documents">{t('focus_documents')}</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon />
                <span className="hidden lg:inline">{t('customize_columns')}</span>
                <span className="lg:hidden">{t('columns')}</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(column => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                .map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {t(column.id)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <PlusIcon />
            <span className="hidden lg:inline">{t('add_section')}</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map(row => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns(t).length} className="h-24 text-center">
                      {noResultsFoundMessage ? (
                        <div className="flex justify-center">{noResultsFoundMessage}</div>
                      ) : (
                        t('no_results')
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} {t('pagination.selected')}{' '}
            {table.getFilteredRowModel().rows.length} {t('pagination.selected_rows')}
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                {t('rows_per_page')}
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={value => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              {t('page')} {table.getState().pagination.pageIndex + 1} {t('pagination.selected')}{' '}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">{t('go_to_first_page')}</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">{t('go_to_previous_page')}</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">{t('go_to_next_page')}</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">{t('go_to_last_page')}</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="past-performance" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="focus-documents" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {item.header}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="gap-1">
          <SheetTitle>{item.header}</SheetTitle>
          <SheetDescription>{t('showing_total_visitors')}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={value => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="var(--color-mobile)"
                    fillOpacity={0.6}
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="var(--color-desktop)"
                    fillOpacity={0.4}
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 font-medium leading-none">
                  {t('trending_up')} <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-muted-foreground">{t('chart_description')}</div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">{t('header.title')}</Label>
              <Input id="header" defaultValue={item.header} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="type">{t('type')}</Label>
                <Select defaultValue={item.type}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder={t('select_type')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Table of Contents">{t('table_of_contents')}</SelectItem>
                    <SelectItem value="Executive Summary">{t('executive_summary')}</SelectItem>
                    <SelectItem value="Technical Approach">{t('technical_approach')}</SelectItem>
                    <SelectItem value="Design">{t('design')}</SelectItem>
                    <SelectItem value="Capabilities">{t('capabilities')}</SelectItem>
                    <SelectItem value="Focus Documents">{t('focus_documents')}</SelectItem>
                    <SelectItem value="Narrative">{t('narrative')}</SelectItem>
                    <SelectItem value="Cover Page">{t('cover_page')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">{t('status')}</Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder={t('select_status')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Done">{t('done')}</SelectItem>
                    <SelectItem value="In Progress">{t('in_progress')}</SelectItem>
                    <SelectItem value="Not Started">{t('not_started')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">{t('target')}</Label>
                <Input id="target" defaultValue={item.target} />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">{t('limit')}</Label>
                <Input id="limit" defaultValue={item.limit} />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="reviewer">{t('reviewer')}</Label>
              <Select defaultValue={item.reviewer}>
                <SelectTrigger id="reviewer" className="w-full">
                  <SelectValue placeholder={t('select_reviewer')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                  <SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
                  <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
          <Button className="w-full">{t('submit')}</Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              {t('done')}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Dữ liệu biểu đồ và cấu hình (giữ nguyên)
const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--primary)',
  },
  mobile: {
    label: 'Mobile',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;
