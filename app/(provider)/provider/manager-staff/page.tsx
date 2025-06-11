'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import StaffCreateModal, { StaffFormData } from './_components/StaffCreateModal';
import { SiteHeader } from '@/components/common/siteHeader';

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

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || staff.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateStaff = (staffData: StaffFormData) => {
    // In a real application, this would be an API call
    const newStaff: Staff = {
      id: Date.now().toString(),
      name: staffData.name,
      position: staffData.position || '',
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
      <SiteHeader title="Dashboard" />
      <div className="p-6 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý nhân viên</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            Tạo tài khoản nhân viên
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc chức vụ..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
              <button className="border rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50">
                <Filter size={20} />
                Bộ lọc
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Tên nhân viên</th>
                  <th className="text-left py-3 px-4">Chức vụ</th>
                  <th className="text-left py-3 px-4">Liên hệ</th>
                  <th className="text-left py-3 px-4">Khu vực</th>
                  <th className="text-left py-3 px-4">Trạng thái</th>
                  <th className="text-left py-3 px-4">Ngày tham gia</th>
                  <th className="text-left py-3 px-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(staff => (
                  <tr key={staff.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{staff.name}</td>
                    <td className="py-3 px-4">{staff.position}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-500" />
                          <span>{staff.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-500" />
                          <span>{staff.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-500" />
                        <span>{staff.location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          staff.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {staff.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(staff.joinDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Edit size={18} className="text-blue-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical size={18} className="text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <StaffCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateStaff}
        />
      </div>
    </>
  );
}
