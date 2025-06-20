'use client';

import { useState } from 'react';
import { StaffFormData } from '@/app/(provider)/provider/manage-staff/components/StaffCreateModal';
import { SiteHeader } from '@/app/(provider)/components/SiteHeader';
import { StaffTable } from './components/StaffTable';
import StaffCreateModal from './components/StaffCreateModal';

interface Staff {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  location: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

const mockStaff: Staff[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    position: 'Nhân viên vệ sinh',
    phone: '0123456789',
    email: 'nguyenvana@example.com',
    location: 'Hà Nội',
    status: 'active',
    joinDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    position: 'Kỹ thuật viên',
    phone: '0987654321',
    email: 'tranthib@example.com',
    location: 'Hồ Chí Minh',
    status: 'active',
    joinDate: '2024-02-20',
  },
  // Add more mock data as needed
];

export default function StaffManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>(mockStaff);

  // const filteredStaff = staffList.filter(staff => {
  //   const matchesSearch =
  //     staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     staff.position.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesStatus = selectedStatus === 'all' || staff.status === selectedStatus;
  //   return matchesSearch && matchesStatus;
  // });

  const handleCreateStaff = (staffData: StaffFormData) => {
    const newStaff: Staff = {
      id: Date.now().toString(),
      name: staffData.name,
      position: staffData.categoryIds.map(categoryId => categoryId.toString()).join(', '),
      phone: '',
      email: '',
      location: '',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
    };

    setStaffList([...staffList, newStaff]);
    setIsCreateModalOpen(false);
  };

  return (
    <>
      <SiteHeader title={'Quản lý nhân viên'} />
      <div className="container mx-auto py-6 px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2"
            />
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang làm việc</option>
              <option value="inactive">Đã nghỉ</option>
            </select>
          </div>
          <button
            className="bg-primary text-white px-4 py-2 rounded"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Thêm nhân viên
          </button>
        </div>
        <StaffTable />
      </div>
      <StaffCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateStaff}
      />
    </>
  );
}
