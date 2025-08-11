'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { SiteHeader } from '@/app/(manager)/components/SiteHeader';
import { useCategories } from '@/hooks/useCategory';
import { Category } from '@/lib/api/services/fetchCategory';
import { Input } from '@/components/ui/input';
import { CategoryList } from './components/CategoryList';
import { CategorySheet } from './components/CategorySheet';

export default function ManageCategory() {
  const [searchParams, setSearchParams] = useState({
    name: '',
  });

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categoryData, isFetching } = useCategories(searchParams);
  const categories = categoryData?.categories || [];

  const handleFilterChange = useCallback((params: Partial<typeof searchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  }, []);

  const handleEditCategory = useCallback((category: Category) => {
    setEditingCategory(category);
    setIsSheetOpen(true);
  }, []);

  const handleCloseSheet = useCallback((open: boolean) => {
    if (!open) {
      setIsSheetOpen(false);
      setEditingCategory(null);
    }
  }, []);

  return (
    <>
      <SiteHeader title="Quản lý danh mục" />
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4 bg-white border-b-2 p-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <form
              className="flex"
              onSubmit={e => {
                e.preventDefault();
                handleFilterChange({ name: searchParams.name });
              }}
              role="search"
              aria-label="Tìm kiếm danh mục"
            >
              <Input
                placeholder="Tìm kiếm danh mục..."
                value={searchParams.name}
                onChange={e => setSearchParams(prev => ({ ...prev, name: e.target.value }))}
                className="pl-10"
                name="category-search"
                aria-label="Tìm kiếm danh mục"
                autoComplete="off"
              />
              <Button
                type="submit"
                className="ml-2 px-4 bg-green-500 hover:bg-green-600 text-white"
                aria-label="Tìm kiếm"
              >
                Tìm
              </Button>
            </form>
          </div>

          <CategorySheet
            trigger={
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <Plus className="h-4 w-4 mr-2" /> Thêm mới
              </Button>
            }
          />
        </div>

        {/* Category List */}
        <CategoryList categories={categories} isLoading={isFetching} onEdit={handleEditCategory} />

        {/* Edit Sheet */}
        <CategorySheet
          category={editingCategory ?? undefined}
          open={isSheetOpen}
          onOpenChange={handleCloseSheet}
        />
      </div>
    </>
  );
}
