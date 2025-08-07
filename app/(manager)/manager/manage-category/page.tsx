'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SiteHeader } from '@/app/(manager)/components/SiteHeader';
import { CategoryTable } from './components/CategoryTable';
import { useCategories, useCreateCategory, useUpdateCategoryById } from '@/hooks/useCategory';
import CategorySheet from './components/CategorySheet';
import { CategoryCreateType } from '@/schemaValidations/category.schema';
import { Category } from '@/lib/api/services/fetchCategory';

export default function ManageCategory() {
  const [searchParams, setSearchParams] = useState({
    name: '',
    limit: 10,
    page: 1,
  });

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  const { data: categoryData, isFetching } = useCategories();
  const { mutate: createCategory } = useCreateCategory();
  const { mutate: updateCategory } = useUpdateCategoryById();

  const handleFilterChange = (params: Partial<typeof searchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  };

  const handleCreateCategory = (data: CategoryCreateType) => {
    createCategory(data);
    setIsSheetOpen(false);
  };

  const handleUpdateCategory = (data: CategoryCreateType) => {
    if (editingCategory) {
      updateCategory({ id: editingCategory.id, data });
      setIsSheetOpen(false);
      setEditingCategory(undefined);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingCategory(undefined);
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
          onFilterChange={handleFilterChange}
          onEdit={handleEditCategory}
        />

        {/* Category Sheet */}
        <CategorySheet
          isOpen={isSheetOpen}
          onClose={handleCloseSheet}
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
          initialData={editingCategory}
          mode={editingCategory ? 'edit' : 'create'}
        />
      </div>
    </>
  );
}
