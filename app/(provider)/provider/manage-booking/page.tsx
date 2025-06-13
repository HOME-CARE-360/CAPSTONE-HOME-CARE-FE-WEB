/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  Search,
  Filter,
  XCircle,
  Users,
  DollarSign,
  MessageSquare,
  Eye,
  UserPlus,
  Star,
  Wrench,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { SiteHeader } from '@/app/(provider)/_components/SiteHeader';
import TagDashboard from './_components/TagDashboard';

export default function ProviderBookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [assignStaffDialog, setAssignStaffDialog] = useState(false);
  const [priceEstimateDialog, setPriceEstimateDialog] = useState(false);

  const bookings = [
    {
      id: 'BK-2024-001',
      customer: {
        name: 'Nguyễn Thị Hoa',
        phone: '+84 (0) 123-456-789',
        email: 'hoa.nguyen@email.com',
        avatar: '/placeholder.svg?height=40&width=40',
        initials: 'NH',
      },
      service: {
        type: 'cleaning',
        category: 'Dọn dẹp nhà cửa sâu',
        description: 'Dọn dẹp toàn bộ nhà 3 phòng ngủ bao gồm bếp, phòng tắm và phòng khách',
        duration: '4 giờ',
        rooms: 8,
        squareFootage: '120 m²',
      },
      location: {
        address: '123 Đường Nguyễn Huệ, Quận 1',
        city: 'TP. Hồ Chí Minh',
        zipCode: '70000',
        coordinates: { lat: 10.7769, lng: 106.7009 },
      },
      schedule: {
        requestedDate: '2024-01-20',
        requestedTime: '09:00 AM',
        flexibility: 'Ưu tiên buổi sáng',
      },
      status: 'pending',
      priority: 'normal',
      createdAt: '2024-01-15T10:30:00Z',
      estimatedPrice: null,
      assignedStaff: null,
      specialRequests: [
        'Sử dụng sản phẩm thân thiện với thú cưng',
        'Chú ý đặc biệt đến khu vực bếp',
      ],
    },
    {
      id: 'BK-2024-002',
      customer: {
        name: 'Trần Văn Minh',
        phone: '+84 (0) 987-654-321',
        email: 'minh.tran@email.com',
        avatar: '/placeholder.svg?height=40&width=40',
        initials: 'TM',
      },
      service: {
        type: 'repair',
        category: 'Sửa chữa điều hòa',
        description: 'Máy điều hòa không làm lạnh và có tiếng ồn lạ',
        device: 'Điều hòa trung tâm',
        brand: 'Daikin',
        model: 'FTKC35UAVMV',
        issueDescription: 'Máy chạy nhưng không làm lạnh, có tiếng ồn lạ từ dàn nóng',
      },
      location: {
        address: '456 Đường Lê Lợi, Quận 3',
        city: 'TP. Hồ Chí Minh',
        zipCode: '70000',
        coordinates: { lat: 10.7691, lng: 106.6917 },
      },
      schedule: {
        requestedDate: '2024-01-18',
        requestedTime: '02:00 PM',
        flexibility: 'Chỉ buổi chiều',
      },
      status: 'assigned',
      priority: 'high',
      createdAt: '2024-01-14T14:20:00Z',
      estimatedPrice: 350000,
      estimatedDuration: '2-3 giờ',
      assignedStaff: {
        id: 'ST-001',
        name: 'Nguyễn Văn Tùng',
        phone: '+84 (0) 111-222-333',
        skills: ['Điều hòa', 'Điện lạnh'],
        rating: 4.9,
        avatar: '/placeholder.svg?height=40&width=40',
        initials: 'NT',
      },
      specialRequests: ['Gọi trước khi đến', 'Vào qua cổng bên'],
    },
    {
      id: 'BK-2024-003',
      customer: {
        name: 'Lê Thị Mai',
        phone: '+84 (0) 456-789-012',
        email: 'mai.le@email.com',
        avatar: '/placeholder.svg?height=40&width=40',
        initials: 'LM',
      },
      service: {
        type: 'cleaning',
        category: 'Dọn dẹp nhà cửa thường xuyên',
        description: 'Dịch vụ dọn dẹp 2 tuần/lần cho căn hộ 2 phòng ngủ',
        duration: '2.5 giờ',
        rooms: 5,
        squareFootage: '80 m²',
      },
      location: {
        address: '789 Đường Võ Văn Tần, Quận 3',
        city: 'TP. Hồ Chí Minh',
        zipCode: '70000',
        coordinates: { lat: 10.7784, lng: 106.6917 },
      },
      schedule: {
        requestedDate: '2024-01-17',
        requestedTime: '11:00 AM',
        flexibility: 'Bất kỳ lúc nào',
      },
      status: 'in_progress',
      priority: 'normal',
      createdAt: '2024-01-12T09:15:00Z',
      estimatedPrice: 200000,
      estimatedDuration: '2.5 giờ',
      assignedStaff: {
        id: 'ST-002',
        name: 'Trần Thị Lan',
        phone: '+84 (0) 333-444-555',
        skills: ['Dọn dẹp nhà cửa', 'Thân thiện môi trường'],
        rating: 4.7,
        avatar: '/placeholder.svg?height=40&width=40',
        initials: 'TL',
      },
      actualStartTime: '2024-01-17T11:15:00Z',
      currentStatus: 'Đang thực hiện',
    },
  ];

  const availableStaff = [
    {
      id: 'ST-001',
      name: 'Nguyễn Văn Tùng',
      phone: '+84 (0) 111-222-333',
      email: 'tung.nguyen@company.com',
      skills: ['Điều hòa', 'Điện', 'Nước'],
      rating: 4.9,
      completedJobs: 234,
      avatar: '/placeholder.svg?height=60&width=60',
      initials: 'NT',
      availability: 'Có sẵn',
      location: 'Khu vực Quận 1',
      distance: '2.3 km',
    },
    {
      id: 'ST-002',
      name: 'Trần Thị Lan',
      phone: '+84 (0) 333-444-555',
      email: 'lan.tran@company.com',
      skills: ['Dọn dẹp nhà cửa', 'Dọn dẹp sâu', 'Thân thiện môi trường'],
      rating: 4.7,
      completedJobs: 189,
      avatar: '/placeholder.svg?height=60&width=60',
      initials: 'TL',
      availability: 'Bận đến 3 PM',
      location: 'Khu vực Quận 3',
      distance: '1.8 km',
    },
    {
      id: 'ST-003',
      name: 'Lê Văn Hùng',
      phone: '+84 (0) 555-666-777',
      email: 'hung.le@company.com',
      skills: ['Sửa chữa thiết bị', 'Bảo trì chung'],
      rating: 4.6,
      completedJobs: 156,
      avatar: '/placeholder.svg?height=60&width=60',
      initials: 'LH',
      availability: 'Có sẵn',
      location: 'Khu vực Quận 7',
      distance: '3.1 km',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'CHỜ XỬ LÝ';
      case 'assigned':
        return 'ĐÃ PHÂN CÔNG';
      case 'in_progress':
        return 'ĐANG THỰC HIỆN';
      case 'completed':
        return 'HOÀN THÀNH';
      case 'cancelled':
        return 'ĐÃ HỦY';
      default:
        return 'KHÔNG XÁC ĐỊNH';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'CAO';
      case 'normal':
        return 'BÌNH THƯỜNG';
      case 'low':
        return 'THẤP';
      default:
        return 'BÌNH THƯỜNG';
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'cleaning':
        return <Sparkles className="h-5 w-5" />;
      case 'repair':
        return <Wrench className="h-5 w-5" />;
      default:
        return <Home className="h-5 w-5" />;
    }
  };

  return (
    <>
      <SiteHeader title="Quản lý đặt lịch" />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          {/* Tổng quan thống kê */}
          <section className="py-8">
            <div className="container px-4">
              <TagDashboard />

              {/* Bộ lọc và tìm kiếm */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Tìm kiếm đặt lịch..." className="pl-10" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="pending">Chờ xử lý</SelectItem>
                        <SelectItem value="assigned">Đã phân công</SelectItem>
                        <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                        <SelectItem value="completed">Hoàn thành</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Loại dịch vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                        <SelectItem value="cleaning">Dọn dẹp</SelectItem>
                        <SelectItem value="repair">Sửa chữa</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Độ ưu tiên" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả mức độ</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                        <SelectItem value="normal">Bình thường</SelectItem>
                        <SelectItem value="low">Thấp</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Bộ lọc khác
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danh sách đặt lịch */}
              <div className="space-y-6">
                {bookings.map(booking => (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header đặt lịch */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              {getServiceIcon(booking.service.type)}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold">
                                  {booking.service.category}
                                </h3>
                                <Badge className={getStatusColor(booking.status)}>
                                  {getStatusText(booking.status)}
                                </Badge>
                                <Badge className={getPriorityColor(booking.priority)}>
                                  {getPriorityText(booking.priority)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Mã đặt lịch: {booking.id}
                              </p>
                              <p className="text-sm">{booking.service.description}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                            {booking.estimatedPrice && (
                              <p className="text-lg font-bold text-green-600">
                                {booking.estimatedPrice.toLocaleString()}đ
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Thông tin khách hàng và địa điểm */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>Thông tin khách hàng</span>
                            </h4>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={booking.customer.avatar || '/placeholder.svg'} />
                                <AvatarFallback>{booking.customer.initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{booking.customer.name}</p>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span className="flex items-center space-x-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{booking.customer.phone}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{booking.customer.email}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>Địa điểm dịch vụ</span>
                            </h4>
                            <div className="text-sm">
                              <p>{booking.location.address}</p>
                              <p className="text-muted-foreground">
                                {booking.location.city}, {booking.location.zipCode}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Lịch trình và chi tiết dịch vụ */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Lịch trình</span>
                            </h4>
                            <div className="text-sm space-y-1">
                              <p>
                                <span className="font-medium">Ngày:</span>{' '}
                                {booking.schedule.requestedDate}
                              </p>
                              <p>
                                <span className="font-medium">Giờ:</span>{' '}
                                {booking.schedule.requestedTime}
                              </p>
                              <p>
                                <span className="font-medium">Linh hoạt:</span>{' '}
                                {booking.schedule.flexibility}
                              </p>
                              {booking.service.duration && (
                                <p>
                                  <span className="font-medium">Thời gian:</span>{' '}
                                  {booking.service.duration}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium">Chi tiết dịch vụ</h4>
                            <div className="text-sm space-y-1">
                              {booking.service.type === 'cleaning' && (
                                <>
                                  <p>
                                    <span className="font-medium">Số phòng:</span>{' '}
                                    {booking.service.rooms}
                                  </p>
                                  <p>
                                    <span className="font-medium">Diện tích:</span>{' '}
                                    {booking.service.squareFootage}
                                  </p>
                                </>
                              )}
                              {booking.service.type === 'repair' && (
                                <>
                                  <p>
                                    <span className="font-medium">Thiết bị:</span>{' '}
                                    {booking.service.device}
                                  </p>
                                  <p>
                                    <span className="font-medium">Hãng:</span>{' '}
                                    {booking.service.brand}
                                  </p>
                                  <p>
                                    <span className="font-medium">Model:</span>{' '}
                                    {booking.service.model}
                                  </p>
                                  <p>
                                    <span className="font-medium">Vấn đề:</span>{' '}
                                    {booking.service.issueDescription}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Yêu cầu đặc biệt */}
                        {booking.specialRequests && booking.specialRequests.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Yêu cầu đặc biệt</h4>
                            <div className="flex flex-wrap gap-2">
                              {booking.specialRequests.map((request, index) => (
                                <Badge key={index} variant="outline">
                                  {request}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Nhân viên được phân công */}
                        {booking.assignedStaff && (
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>Nhân viên được phân công</span>
                            </h4>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage
                                  src={booking.assignedStaff.avatar || '/placeholder.svg'}
                                />
                                <AvatarFallback>{booking.assignedStaff.initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{booking.assignedStaff.name}</p>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>{booking.assignedStaff.phone}</span>
                                  <span className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{booking.assignedStaff.rating}</span>
                                  </span>
                                  <span>Kỹ năng: {booking.assignedStaff.skills.join(', ')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <Separator />

                        {/* Nút hành động */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Xem chi tiết
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Chi tiết đặt lịch - {booking.id}</DialogTitle>
                                </DialogHeader>
                                {selectedBooking && (
                                  <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <h3 className="font-semibold">Thông tin khách hàng</h3>
                                        <div className="space-y-2 text-sm">
                                          <p>
                                            <span className="font-medium">Tên:</span>{' '}
                                            {selectedBooking.customer.name}
                                          </p>
                                          <p>
                                            <span className="font-medium">Điện thoại:</span>{' '}
                                            {selectedBooking.customer.phone}
                                          </p>
                                          <p>
                                            <span className="font-medium">Email:</span>{' '}
                                            {selectedBooking.customer.email}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="space-y-4">
                                        <h3 className="font-semibold">Thông tin dịch vụ</h3>
                                        <div className="space-y-2 text-sm">
                                          <p>
                                            <span className="font-medium">Loại:</span>{' '}
                                            {selectedBooking.service.category}
                                          </p>
                                          <p>
                                            <span className="font-medium">Mô tả:</span>{' '}
                                            {selectedBooking.service.description}
                                          </p>
                                          {selectedBooking.estimatedPrice && (
                                            <p>
                                              <span className="font-medium">Giá ước tính:</span>{' '}
                                              {selectedBooking.estimatedPrice.toLocaleString()}đ
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {booking.status === 'pending' && (
                              <>
                                <Dialog
                                  open={priceEstimateDialog}
                                  onOpenChange={setPriceEstimateDialog}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-green-600"
                                      onClick={() => setSelectedBooking(booking)}
                                    >
                                      <DollarSign className="h-4 w-4 mr-2" />
                                      Đặt giá
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Đặt giá ước tính</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="price">Giá dịch vụ (VNĐ)</Label>
                                        <Input id="price" type="number" placeholder="350000" />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="duration">Thời gian ước tính</Label>
                                        <Select>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Chọn thời gian" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="1-2">1-2 giờ</SelectItem>
                                            <SelectItem value="2-3">2-3 giờ</SelectItem>
                                            <SelectItem value="3-4">3-4 giờ</SelectItem>
                                            <SelectItem value="4-5">4-5 giờ</SelectItem>
                                            <SelectItem value="5+">5+ giờ</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="notes">Ghi chú thêm</Label>
                                        <Textarea
                                          id="notes"
                                          placeholder="Thông tin bổ sung cho khách hàng..."
                                        />
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button
                                          className="flex-1"
                                          onClick={() => setPriceEstimateDialog(false)}
                                        >
                                          Gửi cho khách hàng
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setPriceEstimateDialog(false)}
                                        >
                                          Hủy
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Dialog
                                  open={assignStaffDialog}
                                  onOpenChange={setAssignStaffDialog}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setSelectedBooking(booking)}
                                    >
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      Phân công nhân viên
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Phân công nhân viên</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label>Lọc theo kỹ năng</Label>
                                        <Select>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Chọn kỹ năng cần thiết" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="cleaning">Dọn dẹp</SelectItem>
                                            <SelectItem value="hvac">Điều hòa</SelectItem>
                                            <SelectItem value="electrical">Điện</SelectItem>
                                            <SelectItem value="plumbing">Nước</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {availableStaff.map(staff => (
                                          <Card
                                            key={staff.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                          >
                                            <CardContent className="p-4">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                  <Avatar>
                                                    <AvatarImage
                                                      src={staff.avatar || '/placeholder.svg'}
                                                    />
                                                    <AvatarFallback>
                                                      {staff.initials}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <div>
                                                    <p className="font-medium">{staff.name}</p>
                                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                      <span className="flex items-center space-x-1">
                                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                        <span>{staff.rating}</span>
                                                      </span>
                                                      <span>•</span>
                                                      <span>{staff.completedJobs} công việc</span>
                                                      <span>•</span>
                                                      <span>{staff.distance}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                      {staff.skills.map((skill, index) => (
                                                        <Badge
                                                          key={index}
                                                          variant="secondary"
                                                          className="text-xs"
                                                        >
                                                          {skill}
                                                        </Badge>
                                                      ))}
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="text-right">
                                                  <Badge
                                                    variant={
                                                      staff.availability === 'Có sẵn'
                                                        ? 'default'
                                                        : 'secondary'
                                                    }
                                                  >
                                                    {staff.availability}
                                                  </Badge>
                                                  <Button
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => setAssignStaffDialog(false)}
                                                  >
                                                    Phân công
                                                  </Button>
                                                </div>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}

                            {booking.status === 'assigned' && (
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Liên hệ nhân viên
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {booking.status === 'pending' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Từ chối
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Từ chối đặt lịch</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn từ chối đặt lịch này? Hành động này
                                      không thể hoàn tác.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction>Từ chối đặt lịch</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tải thêm */}
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Tải thêm đặt lịch
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
