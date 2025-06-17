import { StaffTable } from './_components/StaffTable';
import { SiteHeader } from '@/app/(provider)/_components/SiteHeader';

export default function ManageStaffPage() {
  return (
    <>
      <SiteHeader title={'Quản lý nhân viên'} />
      <div className="container mx-auto py-6 px-6">
        <StaffTable />
      </div>
    </>
  );
}
