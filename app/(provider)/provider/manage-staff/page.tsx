import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { StaffTable } from './components/StaffTable';

export default function StaffManagementPage() {
  return (
    <>
      <SiteHeader title={'Quản lý nhân viên'} />
      <div className="container mx-auto py-6 px-6">
        <StaffTable />
      </div>
    </>
  );
}
