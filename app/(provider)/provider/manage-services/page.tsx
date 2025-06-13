'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/app/(provider)/_components/SiteHeader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ServiceTable } from './_components/ServiceTable';
import { Plus } from 'lucide-react';
import { Service } from '@/lib/api/services/fetchService';

interface Category {
  id: string;
  name: string;
  description?: string;
}

// interface ServiceFormValues {
//   name: string;
//   description: string;
//   basePrice: number;
//   virtualPrice: number;
//   durationMinutes: number;
//   images: string[];
//   categories: string[];
// }

export default function ManageServicesPage() {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [open, setOpen] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  // Mock data - sẽ thay thế bằng API calls thực tế
  useEffect(() => {
    // Mock categories
    const mockCategories: Category[] = [
      { id: '1', name: 'Dọn dẹp nhà cửa', description: 'Các dịch vụ dọn dẹp và vệ sinh' },
      { id: '2', name: 'Sửa chữa điện', description: 'Sửa chữa và lắp đặt thiết bị điện' },
      { id: '3', name: 'Sửa chữa nước', description: 'Sửa chữa hệ thống nước và ống nước' },
      { id: '4', name: 'Sửa chữa điều hòa', description: 'Bảo trì và sửa chữa điều hòa' },
      { id: '5', name: 'Sơn nhà', description: 'Dịch vụ sơn và trang trí' },
    ];

    // Mock services
    const mockServices: Service[] = [
      {
        id: 3,
        name: 'Dọn dẹp nhà cửa tổng quát',
        description:
          'Dịch vụ dọn dẹp toàn bộ ngôi nhà bao gồm phòng khách, phòng ngủ, bếp và phòng tắm',
        basePrice: 200000,
        virtualPrice: 250000,
        durationMinutes: 180,
        images: ['/placeholder.svg?height=200&width=300'],
        categories: [mockCategories[0]],
        provider: 'Công ty ABC',
        providerId: 1,
      },
      {
        id: 2,
        name: 'Sửa chữa điện dân dụng',
        description: 'Sửa chữa các thiết bị điện trong gia đình, thay thế ổ cắm, công tắc',
        basePrice: 150000,
        virtualPrice: 200000,
        durationMinutes: 120,
        images: ['/placeholder.svg?height=200&width=300'],
        categories: [mockCategories[1]],
        provider: 'Công ty ABC',

        providerId: 1,
      },
      {
        id: 3,
        name: 'Vệ sinh điều hòa',
        description: 'Vệ sinh và bảo trì điều hòa không khí, thay filter',
        basePrice: 100000,
        virtualPrice: 150000,
        durationMinutes: 90,
        images: ['/placeholder.svg?height=200&width=300'],
        categories: [mockCategories[3]],
        provider: 'Công ty ABC',
        providerId: 1,
      },
    ];

    setCategories(mockCategories);
    setServices(mockServices);
  }, []);

  // const handleSubmit = async (data: ServiceFormValues) => {
  //   try {
  //     setIsLoading(true);

  //     if (editingService) {
  //       // Cập nhật dịch vụ
  //       const updatedService: Service = {
  //         ...editingService,
  //         ...data,
  //         categories: categories.filter(cat => data.categories.includes(cat.id)),
  //         updatedAt: new Date().toISOString(),
  //       };

  //       setServices(prev =>
  //         prev.map(service => (service.id === editingService.id ? updatedService : service))
  //       );

  //       console.log('Cập nhật dịch vụ:', updatedService);
  //     } else {
  //       // Tạo dịch vụ mới
  //       const newService: Service = {
  //         id: Date.now().toString(),
  //         ...data,
  //         categories: categories.filter(cat => data.categories.includes(cat.id)),
  //         provider: 'Công ty ABC',
  //         isActive: true,
  //         createdAt: new Date().toISOString(),
  //         updatedAt: new Date().toISOString(),
  //         providerId: 1,
  //       };

  //       setServices(prev => [...prev, newService]);
  //       console.log('Tạo dịch vụ mới:', newService);
  //     }

  //     setEditingService(null);
  //     setOpen(false);
  //   } catch (error) {
  //     console.error('Lỗi khi lưu dịch vụ:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleEdit = (service: Service) => {
  //   setEditingService(service);
  //   setOpen(true);
  // };

  // const handleDelete = async (serviceId: string) => {
  //   try {
  //     setServices(prev => prev.filter(service => service.id !== serviceId));
  //     console.log('Xóa dịch vụ:', serviceId);
  //   } catch (error) {
  //     console.error('Lỗi khi xóa dịch vụ:', error);
  //   }
  // };

  // const handleToggleActive = async (serviceId: string) => {
  //   try {
  //     setServices(prev =>
  //       prev.map(service =>
  //         service.id === serviceId
  //           ? { ...service, isActive: !service.isActive, updatedAt: new Date().toISOString() }
  //           : service
  //       )
  //     );
  //     console.log('Thay đổi trạng thái dịch vụ:', serviceId);
  //   } catch (error) {
  //     console.error('Lỗi khi thay đổi trạng thái:', error);
  //   }
  // };

  return (
    <>
      <SiteHeader title="Quản lý dịch vụ" />

      <div className="container mx-auto p-6 space-y-6">
        {/* Header với nút thêm dịch vụ */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Quản lý dịch vụ</h1>
            <p className="text-muted-foreground">
              Quản lý các dịch vụ mà bạn cung cấp cho khách hàng
            </p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-green-600 hover:bg-green-500"
                onClick={() => setEditingService(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm dịch vụ mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
                </DialogTitle>
              </DialogHeader>
              {/* <ServiceForm
                editingService={editingService}
                categories={categories}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setEditingService(null);
                  setOpen(false);
                }}
                isLoading={isLoading}
              /> */}
            </DialogContent>
          </Dialog>
        </div>

        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng dịch vụ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.length}</div>
              <p className="text-xs text-muted-foreground">
                {services.filter(s => s.isActive).length} đang hoạt động
              </p>
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giá trung bình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {services.length > 0
                  ? Math.round(
                      services.reduce((sum, s) => sum + s.basePrice, 0) / services.length
                    ).toLocaleString()
                  : 0}
                đ
              </div>
              <p className="text-xs text-muted-foreground">Giá cơ bản trung bình</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thời gian trung bình</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {services.length > 0
                  ? Math.round(
                      services.reduce((sum, s) => sum + s.durationMinutes, 0) / services.length
                    )
                  : 0}{' '}
                phút
              </div>
              <p className="text-xs text-muted-foreground">Thời gian thực hiện trung bình</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Danh mục</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Tổng số danh mục dịch vụ</p>
            </CardContent>
          </Card>
        </div>

        {/* Bảng dịch vụ */}
        <Card>
          <CardContent>
            <ServiceTable
              data={services} // categories={categories}
              // onEdit={handleEdit}
              // onDelete={() => {}}
              // onToggleActive={() => {}}
              // isLoading={false}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
