'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  Sparkles,
  Wrench,
  Zap,
  Droplets,
  Wind,
  Paintbrush,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Star,
  Info,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';

// Mock data cho dịch vụ
const services = [
  {
    id: 1,
    name: 'Dọn dẹp nhà cửa tổng quát',
    category: 'Dọn dẹp',
    description: 'Dọn dẹp toàn bộ ngôi nhà bao gồm phòng khách, phòng ngủ, bếp, toilet',
    basePrice: 150000,
    duration: 180, // phút
    icon: <Sparkles className="h-6 w-6" />,
    image: '/placeholder.svg?height=200&width=300',
    features: ['Hút bụi', 'Lau nhà', 'Dọn toilet', 'Lau kính'],
    rating: 4.8,
    bookingCount: 234,
  },
  {
    id: 2,
    name: 'Sửa chữa điện dân dụng',
    category: 'Sửa chữa điện',
    description: 'Sửa chữa các thiết bị điện, thay thế ổ cắm, công tắc, đèn chiếu sáng',
    basePrice: 200000,
    duration: 120,
    icon: <Zap className="h-6 w-6" />,
    image: '/placeholder.svg?height=200&width=300',
    features: ['Thay ổ cắm', 'Sửa công tắc', 'Lắp đèn', 'Kiểm tra an toàn'],
    rating: 4.9,
    bookingCount: 189,
  },
  {
    id: 3,
    name: 'Sửa chữa đường ống nước',
    category: 'Sửa chữa nước',
    description: 'Sửa chữa rò rỉ, thay thế vòi nước, thông tắc cống',
    basePrice: 180000,
    duration: 90,
    icon: <Droplets className="h-6 w-6" />,
    image: '/placeholder.svg?height=200&width=300',
    features: ['Sửa rò rỉ', 'Thay vòi nước', 'Thông cống', 'Kiểm tra áp lực'],
    rating: 4.7,
    bookingCount: 156,
  },
  {
    id: 4,
    name: 'Vệ sinh điều hòa',
    category: 'Sửa chữa điều hòa',
    description: 'Vệ sinh, bảo dưỡng và sửa chữa điều hòa không khí',
    basePrice: 250000,
    duration: 150,
    icon: <Wind className="h-6 w-6" />,
    image: '/placeholder.svg?height=200&width=300',
    features: ['Vệ sinh dàn lạnh', 'Thay gas', 'Kiểm tra máy nén', 'Bảo dưỡng'],
    rating: 4.6,
    bookingCount: 98,
  },
  {
    id: 5,
    name: 'Sơn tường nhà',
    category: 'Sơn nhà',
    description: 'Sơn lại tường nhà, sửa chữa vết nứt, làm mới không gian',
    basePrice: 300000,
    duration: 240,
    icon: <Paintbrush className="h-6 w-6" />,
    image: '/placeholder.svg?height=200&width=300',
    features: ['Chuẩn bị bề mặt', 'Sơn lót', 'Sơn hoàn thiện', 'Dọn dẹp'],
    rating: 4.5,
    bookingCount: 67,
  },
];

const timeSlots = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
];

const districts = [
  'Quận 1',
  'Quận 2',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 6',
  'Quận 7',
  'Quận 8',
  'Quận 9',
  'Quận 10',
  'Quận 11',
  'Quận 12',
  'Quận Bình Thạnh',
  'Quận Gò Vấp',
  'Quận Phú Nhuận',
  'Quận Tân Bình',
  'Quận Tân Phú',
  'Quận Thủ Đức',
  'Huyện Bình Chánh',
  'Huyện Hóc Môn',
];

export default function BookingPage() {
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingData, setBookingData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    notes: '',
    urgentService: false,
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleServiceToggle = (serviceId: number) => {
    setSelectedServices(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const calculateTotal = () => {
    const servicesTotal = selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.basePrice || 0);
    }, 0);

    const urgentFee = bookingData.urgentService ? servicesTotal * 0.2 : 0;
    return servicesTotal + urgentFee;
  };

  const calculateDuration = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.duration || 0);
    }, 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}p`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}p`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0 || !selectedDate || !selectedTime) {
      alert('Vui lòng chọn dịch vụ, ngày và giờ');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmBooking = () => {
    // TODO: Gửi dữ liệu booking lên server
    console.log('Booking confirmed:', {
      services: selectedServices,
      date: selectedDate,
      time: selectedTime,
      customer: bookingData,
      total: calculateTotal(),
    });
    alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
    setShowConfirmation(false);
    // Reset form
    setSelectedServices([]);
    setSelectedDate(undefined);
    setSelectedTime('');
    setBookingData({
      customerName: '',
      phone: '',
      email: '',
      address: '',
      district: '',
      notes: '',
      urgentService: false,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt lịch dịch vụ</h1>
            <p className="text-gray-600">Chọn dịch vụ và thời gian phù hợp với bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Service Selection */}
              <div className="lg:col-span-2 space-y-6">
                {/* Service Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Wrench className="h-5 w-5" />
                      <span>Chọn dịch vụ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {services.map(service => (
                        <div
                          key={service.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedServices.includes(service.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleServiceToggle(service.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={selectedServices.includes(service.id)}
                              onChange={() => handleServiceToggle(service.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {service.icon}
                                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{service.description}</p>

                              <div className="flex flex-wrap gap-1 mb-3">
                                {service.features.map((feature, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatDuration(service.duration)}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{service.rating}</span>
                                  </span>
                                  <span>({service.bookingCount} lượt đặt)</span>
                                </div>
                                <div className="text-lg font-bold text-blue-600">
                                  {service.basePrice.toLocaleString('vi-VN')}đ
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Date & Time Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5" />
                      <span>Chọn ngày và giờ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Date Selection */}
                      <div className="space-y-2">
                        <Label>Chọn ngày</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !selectedDate && 'text-muted-foreground'
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate
                                ? format(selectedDate, 'dd/MM/yyyy', { locale: vi })
                                : 'Chọn ngày'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={date => date < new Date() || date < new Date('1900-01-01')}
                              initialFocus
                              locale={vi}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Time Selection */}
                      <div className="space-y-2">
                        <Label>Chọn giờ</Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giờ" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map(time => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {selectedDate && selectedTime && (
                      <Alert className="mt-4">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Dịch vụ sẽ được thực hiện vào{' '}
                          <strong>
                            {format(selectedDate, 'dd/MM/yyyy', { locale: vi })} lúc {selectedTime}
                          </strong>
                          {calculateDuration() > 0 && (
                            <span>
                              {' '}
                              - Thời gian dự kiến:{' '}
                              <strong>{formatDuration(calculateDuration())}</strong>
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Thông tin khách hàng</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Họ và tên *</Label>
                        <Input
                          id="customerName"
                          value={bookingData.customerName}
                          onChange={e =>
                            setBookingData(prev => ({ ...prev, customerName: e.target.value }))
                          }
                          placeholder="Nhập họ và tên"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Số điện thoại *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={bookingData.phone}
                          onChange={e =>
                            setBookingData(prev => ({ ...prev, phone: e.target.value }))
                          }
                          placeholder="0901234567"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={bookingData.email}
                        onChange={e => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="address">Địa chỉ *</Label>
                        <Input
                          id="address"
                          value={bookingData.address}
                          onChange={e =>
                            setBookingData(prev => ({ ...prev, address: e.target.value }))
                          }
                          placeholder="Số nhà, tên đường"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">Quận/Huyện *</Label>
                        <Select
                          value={bookingData.district}
                          onValueChange={value =>
                            setBookingData(prev => ({ ...prev, district: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn quận/huyện" />
                          </SelectTrigger>
                          <SelectContent>
                            {districts.map(district => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Ghi chú đặc biệt</Label>
                      <Textarea
                        id="notes"
                        value={bookingData.notes}
                        onChange={e => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu đặc biệt..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="space-y-6">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Tóm tắt đặt lịch</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedServices.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          <h4 className="font-medium">Dịch vụ đã chọn:</h4>
                          {selectedServices.map(serviceId => {
                            const service = services.find(s => s.id === serviceId);
                            if (!service) return null;
                            return (
                              <div
                                key={serviceId}
                                className="flex justify-between items-start text-sm"
                              >
                                <div className="flex-1">
                                  <p className="font-medium">{service.name}</p>
                                  <p className="text-gray-500">
                                    {formatDuration(service.duration)}
                                  </p>
                                </div>
                                <p className="font-medium">
                                  {service.basePrice.toLocaleString('vi-VN')}đ
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        <Separator />

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Tổng dịch vụ:</span>
                            <span>
                              {selectedServices
                                .reduce((total, serviceId) => {
                                  const service = services.find(s => s.id === serviceId);
                                  return total + (service?.basePrice || 0);
                                }, 0)
                                .toLocaleString('vi-VN')}
                              đ
                            </span>
                          </div>

                          {bookingData.urgentService && (
                            <div className="flex justify-between text-orange-600">
                              <span>Phí khẩn cấp (20%):</span>
                              <span>
                                +
                                {(
                                  selectedServices.reduce((total, serviceId) => {
                                    const service = services.find(s => s.id === serviceId);
                                    return total + (service?.basePrice || 0);
                                  }, 0) * 0.2
                                ).toLocaleString('vi-VN')}
                                đ
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between">
                            <span>Thời gian dự kiến:</span>
                            <span>{formatDuration(calculateDuration())}</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Tổng cộng:</span>
                          <span className="text-blue-600">
                            {calculateTotal().toLocaleString('vi-VN')}đ
                          </span>
                        </div>

                        {selectedDate && selectedTime && (
                          <div className="p-3 bg-blue-50 rounded-lg text-sm">
                            <p className="font-medium text-blue-900">Thời gian thực hiện:</p>
                            <p className="text-blue-700">
                              {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })} lúc{' '}
                              {selectedTime}
                            </p>
                          </div>
                        )}

                        <Button type="submit" className="w-full" size="lg">
                          Đặt lịch ngay
                        </Button>

                        <p className="text-xs text-gray-500 text-center">
                          Bằng cách đặt lịch, bạn đồng ý với{' '}
                          <Link href="/terms" className="text-blue-600 hover:underline">
                            Điều khoản dịch vụ
                          </Link>{' '}
                          của chúng tôi
                        </p>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>Chưa có dịch vụ nào được chọn</p>
                        <p className="text-sm">Vui lòng chọn dịch vụ để tiếp tục</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cần hỗ trợ?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span>Hotline: 1900 1234</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span>support@homecare360.vn</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>Hỗ trợ 24/7</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Xác nhận đặt lịch</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Thông tin đặt lịch:</h4>
              <div className="text-sm space-y-1 text-gray-600">
                <p>
                  <strong>Khách hàng:</strong> {bookingData.customerName}
                </p>
                <p>
                  <strong>Điện thoại:</strong> {bookingData.phone}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {bookingData.address}, {bookingData.district}
                </p>
                {selectedDate && selectedTime && (
                  <p>
                    <strong>Thời gian:</strong> {format(selectedDate, 'dd/MM/yyyy', { locale: vi })}{' '}
                    lúc {selectedTime}
                  </p>
                )}
                <p>
                  <strong>Tổng tiền:</strong> {calculateTotal().toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Chúng tôi sẽ liên hệ với bạn trong vòng 15 phút để xác nhận lịch hẹn.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button onClick={confirmBooking} className="flex-1">
                Xác nhận đặt lịch
              </Button>
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
