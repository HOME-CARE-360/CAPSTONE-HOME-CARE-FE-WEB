'use client';

import type React from 'react';
import { useUserProfile } from '@/hooks/useUser';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  User,
  CreditCard,
  Building2,
  FileText,
  CheckCircle,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useService } from '@/hooks/useService';
import { useGetProviderInfomation } from '@/hooks/useUser';
import Image from 'next/image';
import { CreateBookingRequest } from '@/lib/api/services/fetchBooking';
import { useCreateBooking } from '@/hooks/useBooking';

const paymentMethods = [
  {
    value: 'BANK_TRANSFER' as const,
    label: 'Chuyển khoản ngân hàng',
    description: 'Thanh toán qua chuyển khoản',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    value: 'CREDIT_CARD' as const,
    label: 'Thẻ tín dụng',
    description: 'Thanh toán bằng thẻ tín dụng',
    icon: <CreditCard className="h-5 w-5" />,
  },
];

export default function NewBookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: profifeData } = useUserProfile();
  const params = useParams();
  const serviceId = params.serviceId;
  const { data: serviceData } = useService(serviceId as unknown as string);
  const { data: profileProvider } = useGetProviderInfomation(
    serviceData?.service?.providerId ? String(serviceData.service.providerId) : ''
  );
  const { mutateAsync: createBooking } = useCreateBooking();

  const [formData, setFormData] = useState<CreateBookingRequest>({
    providerId: 0,
    note: '',
    preferredDate: '',
    location: '',
    categoryId: 0,
    phoneNumber: '',
    paymentMethod: 'BANK_TRANSFER',
  });

  const [errors, setErrors] = useState<Partial<CreateBookingRequest>>({});

  // Filter providers based on selected category
  useEffect(() => {
    if (formData.categoryId > 0) {
      // const filtered = profileProvider?.data.filter(provider =>
      //   provider.specialties.includes(formData.categoryId)
      // );
      // setAvailableProviders(filtered);
      // Reset provider selection if current provider doesn't support the category
      // if (formData.providerId > 0) {
      //     const currentProvider = providers.find(p => p.id === formData.providerId);
      //   if (currentProvider && !currentProvider.specialties.includes(formData.categoryId)) {
      //     setFormData(prev => ({ ...prev, providerId: 0 }));
      //   }
      // }
    } else {
      // setAvailableProviders(providers);
    }
  }, [formData.categoryId, formData.providerId]);

  // Update preferredDate when date is selected
  useEffect(() => {
    if (selectedDate) {
      try {
        setFormData(prev => ({
          ...prev,
          preferredDate: format(selectedDate, 'yyyy-MM-dd'),
        }));
      } catch (error) {
        console.error('Date formatting error:', error);
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    if (profifeData?.data?.user?.phone) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: profifeData.data.user.phone || prev.phoneNumber,
      }));
    }
  }, [profifeData]);

  // Update providerId when service data is loaded
  useEffect(() => {
    if (serviceData?.service?.providerId) {
      setFormData(prev => ({
        ...prev,
        providerId: serviceData.service.providerId,
        categoryId: 1, // Set a default categoryId for validation
      }));
    }
  }, [serviceData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateBookingRequest> = {};

    if (!formData.categoryId) newErrors.categoryId = 0;
    if (!formData.providerId) newErrors.providerId = 0;
    if (!formData.preferredDate) newErrors.preferredDate = '';
    if (!formData.location.trim()) newErrors.location = '';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = '';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowConfirmation(true);
  };

  const confirmBooking = async () => {
    setIsSubmitting(true);

    try {
      await createBooking(formData);

      // Reset form on success
      setFormData({
        providerId: 0,
        note: '',
        preferredDate: '',
        location: '',
        categoryId: 0,
        phoneNumber: '',
        paymentMethod: 'BANK_TRANSFER',
      });
      setSelectedDate(undefined);
      setShowConfirmation(false);
    } catch (error) {
      // Error is handled by the hook with toast
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt lịch dịch vụ</h1>
            <p className="text-gray-600">Điền thông tin để đặt lịch dịch vụ</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Form Fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Thông tin khách hàng</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Khách hàng</Label>
                      <Input
                        id="name"
                        type="text"
                        value={profifeData?.data?.user?.name || ''}
                        disabled
                        onChange={e =>
                          setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))
                        }
                        placeholder={profifeData?.data?.user?.name || ''}
                        className={''}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Số điện thoại liên hệ</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))
                        }
                        placeholder={profifeData?.data?.user?.phone || 'Nhập số điện thoại'}
                        className={errors.phoneNumber ? 'border-red-500' : ''}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Category Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Wrench className="h-5 w-5" />
                      <span>Dịch vụ đã chọn</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Wrench className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {serviceData?.service?.name || 'Name'}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {serviceData?.service?.description || 'Mô tả'}
                        </p>
                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary">
                            {serviceData?.service?.basePrice?.toLocaleString('vi-VN')}đ
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Thời gian: {serviceData?.service?.durationMinutes || '00'} phút
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Provider Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>Nhà cung cấp</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div
                        className={`border rounded-lg p-4 cursor-pointer transition-all  'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <Image
                            src={
                              profileProvider?.data?.provider?.logo ||
                              'https://github.com/shadcn.png'
                            }
                            alt={profileProvider?.data?.user.name || ''}
                            className="w-12 h-12 rounded-lg object-cover"
                            width={100}
                            height={100}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {profileProvider?.data?.user.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {profileProvider?.data?.provider?.address}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <span className="text-yellow-500">★</span>
                                <span>20</span>
                              </span>
                              <span>200 công việc hoàn thành</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Date & Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5" />
                      <span>Thời gian và địa điểm</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-1 gap-4">
                      {/* Date Selection */}
                      <div className="space-y-2">
                        <Label>Chọn ngày</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${
                                !selectedDate && 'text-muted-foreground'
                              } ${errors.preferredDate ? 'border-red-500' : ''}`}
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
                        {errors.preferredDate && (
                          <p className="text-sm text-red-500">Vui lòng chọn ngày</p>
                        )}
                      </div>

                      {/* Location */}
                      <div className="space-y-2">
                        <Label htmlFor="location">Địa chỉ thực hiện</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, location: e.target.value }))
                          }
                          placeholder="Nhập địa chỉ chi tiết"
                          className={errors.location ? 'border-red-500' : ''}
                        />
                        {errors.location && (
                          <p className="text-sm text-red-500">Vui lòng nhập địa chỉ</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Phương thức thanh toán</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={value =>
                        setFormData(prev => ({
                          ...prev,
                          paymentMethod: value as CreateBookingRequest['paymentMethod'],
                        }))
                      }
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        {paymentMethods.map(method => (
                          <div key={method.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={method.value} id={method.value} />
                            <Label
                              htmlFor={method.value}
                              className="flex items-center space-x-3 cursor-pointer flex-1"
                            >
                              {method.icon}
                              <div>
                                <p className="font-medium">{method.label}</p>
                                <p className="text-sm text-gray-500">{method.description}</p>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Ghi chú</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="note">Ghi chú thêm</Label>
                      <Textarea
                        id="note"
                        value={formData.note}
                        onChange={e => setFormData(prev => ({ ...prev, note: e.target.value }))}
                        placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu đặc biệt..."
                        rows={4}
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
                      <CheckCircle className="h-5 w-5" />
                      <span>Tóm tắt đặt lịch</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Customer Information */}
                    {profifeData?.data?.user && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Khách hàng:</h4>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{profifeData.data.user.name}</p>
                          <p>{profifeData.data.user.phone}</p>
                        </div>
                      </div>
                    )}

                    {/* Service Information */}
                    {serviceData?.service && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Dịch vụ:</h4>
                        <div className="flex items-center space-x-2">
                          <Wrench className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">{serviceData.service.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{serviceData.service.description}</p>
                      </div>
                    )}

                    {/* Provider Information */}
                    {profileProvider?.data && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Nhà cung cấp:</h4>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{profileProvider.data.user.name}</p>
                          <p>{profileProvider?.data?.provider?.address}</p>
                        </div>
                      </div>
                    )}

                    {/* Date Information */}
                    {formData.preferredDate && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Ngày thực hiện:</h4>
                        <p className="text-sm text-gray-600">
                          {selectedDate
                            ? format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })
                            : formData.preferredDate}
                        </p>
                      </div>
                    )}

                    {/* Location Information */}
                    {formData.location && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Địa chỉ:</h4>
                        <p className="text-sm text-gray-600">{formData.location}</p>
                      </div>
                    )}

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Thanh toán:</h4>
                      <p className="text-sm text-gray-600">
                        {paymentMethods.find(m => m.value === formData.paymentMethod)?.label}
                      </p>
                    </div>

                    {/* Notes */}
                    {formData.note && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Ghi chú:</h4>
                        <p className="text-sm text-gray-600">{formData.note}</p>
                      </div>
                    )}

                    {/* Price Information */}
                    {serviceData?.service?.basePrice && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span>Giá dự kiến:</span>
                          <span className="text-blue-600">
                            {serviceData.service.basePrice.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          *Giá cuối cùng sẽ được xác nhận sau khi khảo sát
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
                      </Link>
                    </p>
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
                {/* {selectedCustomer && (
                  <p>
                    <strong>Khách hàng:</strong> {selectedCustomer.name}
                  </p>
                )} */}
                <p>
                  <strong>SĐT:</strong> {formData.phoneNumber}
                </p>
                {/* {selectedCategory && (
                  <p>
                    <strong>Dịch vụ:</strong> {selectedCategory.name}
                  </p>
                )}
                {selectedProvider && (
                  <p>
                    <strong>Nhà cung cấp:</strong> {selectedProvider.name}
                  </p>
                )} */}
                <p>
                  <strong>Ngày:</strong>{' '}
                  {selectedDate
                    ? format(selectedDate, 'dd/MM/yyyy', { locale: vi })
                    : formData.preferredDate}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {formData.location}
                </p>
                <p>
                  <strong>Thanh toán:</strong>{' '}
                  {paymentMethods.find(m => m.value === formData.paymentMethod)?.label}
                </p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Chúng tôi sẽ liên hệ với bạn trong vòng 15 phút để xác nhận lịch hẹn và báo giá chi
                tiết.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button onClick={confirmBooking} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
