'use client';

import { SiteHeader } from '@/app/(manager)/components/SiteHeader';
import { CategoryTable } from './components/CategoryTable';

export default function ManageCategory() {
  return (
    <>
      <SiteHeader title={'Quản lý danh mục'} />
      <div className="container mx-auto py-6 px-6">
        <CategoryTable />
      </div>
    </>
  );
}
