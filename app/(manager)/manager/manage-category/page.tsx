'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SiteHeader } from '@/app/(manager)/components/SiteHeader';
import { CategoryTable } from './components/CategoryTable';
import { useCategories, useCreateCategory } from '@/hooks/useCategory';
import CategorySheet from './components/CategorySheet';
import { CategoryCreateType } from '@/schemaValidations/category.schema';

export default function ManageCategory() {
  const [searchParams, setSearchParams] = useState({
    name: '',
    limit: 10,
    page: 1,
  });

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: categoryData, isFetching } = useCategories();
  const { mutate: createCategory } = useCreateCategory();

  const handleFilterChange = (params: Partial<typeof searchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  };

  const handleCreateCategory = (data: CategoryCreateType) => {
    createCategory(data);
    setIsSheetOpen(false);
  };

  return (
    <>
      <SiteHeader title="Quản lý danh mục" />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
            <p className="text-muted-foreground">Quản lý và cập nhật các danh mục dịch vụ</p>
          </div>
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm danh mục mới
          </Button>
        </div>

        {/* Category Table */}
        <CategoryTable
          data={categoryData?.categories || []}
          isLoading={isFetching}
          page={searchParams.page}
          limit={searchParams.limit}
          onFilterChange={handleFilterChange}
          searchFilters={searchParams}
        />

        {/* Category Sheet */}
        <CategorySheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onSubmit={handleCreateCategory}
          mode="create"
        />
      </div>
    </>
  );
}
