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
import { Calendar24 } from '@/components/custom-date-picker';
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

  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const [timeError, setTimeError] = useState<string>('');

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

  // Update preferredDate when date or time is selected
  useEffect(() => {
    if (selectedDate && selectedTime) {
      try {
        // Combine date and time into ISO string
        const [hours, minutes] = selectedTime.split(':');
        const dateTime = new Date(selectedDate);
        dateTime.setHours(parseInt(hours, 10));
        dateTime.setMinutes(parseInt(minutes, 10));
        dateTime.setSeconds(0);
        dateTime.setMilliseconds(0);

        const isoString = dateTime.toISOString();
        console.log('Setting preferredDate to:', isoString); // Debug log

        setFormData(prev => ({
          ...prev,
          preferredDate: isoString,
        }));
      } catch (error) {
        console.error('Date formatting error:', error);
        setFormData(prev => ({
          ...prev,
          preferredDate: '',
        }));
      }
    } else {
      // Clear preferredDate if date or time is missing
      setFormData(prev => ({
        ...prev,
        preferredDate: '',
      }));
    }
  }, [selectedDate, selectedTime]);

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

  const validateTime = (timeStr: string): boolean => {
    if (!timeStr) {
      setTimeError('Vui lòng chọn giờ');
      return false;
    }

    const [hours, minutes] = timeStr.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const minTimeInMinutes = 7 * 60; // 7:00 AM
    const maxTimeInMinutes = 19 * 60; // 7:00 PM

    // Check business hours first
    if (timeInMinutes < minTimeInMinutes) {
      setTimeError('Giờ phải từ 7:00 sáng trở về sau');
      return false;
    }

    if (timeInMinutes > maxTimeInMinutes) {
      setTimeError('Giờ phải trước 19:00 tối');
      return false;
    }

    // Check if selected date is today and time is in the past
    if (selectedDate) {
      const currentDate = new Date();
      const isToday = selectedDate.toDateString() === currentDate.toDateString();

      if (isToday) {
        const currentTimeInMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

        if (timeInMinutes <= currentTimeInMinutes) {
          const nextAvailableHour = Math.max(currentDate.getHours() + 1, 7);
          if (nextAvailableHour > 19) {
            setTimeError('Không thể đặt lịch hôm nay. Vui lòng chọn ngày mai');
          } else {
            setTimeError(
              `Không thể đặt lịch trong quá khứ. Vui lòng chọn từ ${nextAvailableHour}:00 trở đi`
            );
          }
          return false;
        }
      }
    }

    setTimeError('');
    return true;
  };

  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime);
    validateTime(newTime);
  };

  // Re-validate time when date changes (for today vs future date scenarios)
  useEffect(() => {
    if (selectedTime) {
      validateTime(selectedTime);
    }
  }, [selectedDate, validateTime]);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateBookingRequest> = {};

    if (!formData.categoryId) newErrors.categoryId = 0;
    if (!formData.providerId) newErrors.providerId = 0;

    // Validate preferredDate as ISO string
    if (!formData.preferredDate) {
      newErrors.preferredDate = '';
    } else {
      try {
        const testDate = new Date(formData.preferredDate);
        if (isNaN(testDate.getTime())) {
          newErrors.preferredDate = '';
        }
      } catch (error) {
        newErrors.preferredDate = '';
      }
    }

    if (!formData.location.trim()) newErrors.location = '';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = '';

    setErrors(newErrors);

    // Validate time separately
    const isTimeValid = validateTime(selectedTime);

    console.log('Form validation:', {
      errors: newErrors,
      timeValid: isTimeValid,
      preferredDate: formData.preferredDate,
      selectedDate,
      selectedTime,
    }); // Debug log

    return Object.keys(newErrors).length === 0 && isTimeValid;
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
      console.log('Submitting booking with data:', formData); // Debug log
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
      setSelectedTime('09:00');
      setTimeError('');
      setErrors({});
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
                <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="bg-gray-50 border-b border-gray-100">
                    <CardTitle className="flex items-center space-x-3 text-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-gray-900">Thời gian và địa điểm</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    {/* Date & Time Selection */}
                    <div className="space-y-4">
                      <Calendar24
                        value={selectedDate}
                        onChange={setSelectedDate}
                        onTimeChange={handleTimeChange}
                        timeValue={selectedTime}
                        error={!!errors.preferredDate}
                        timeError={timeError}
                        placeholder="Chọn ngày thực hiện dịch vụ"
                        className="w-full"
                      />
                      {errors.preferredDate && (
                        <p className="text-sm text-red-500 flex items-center space-x-2 bg-red-50 p-3 rounded-lg border border-red-200">
                          <span>⚠️</span>
                          <span>Vui lòng chọn ngày thực hiện</span>
                        </p>
                      )}
                    </div>

                    {/* Location */}
                    <div className="space-y-3">
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                        Địa chỉ thực hiện dịch vụ
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, quận/huyện...)"
                        className={`h-12 border-gray-300 hover:border-gray-400 focus:border-blue-500 transition-colors duration-200 ${
                          errors.location ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                      {errors.location && (
                        <p className="text-sm text-red-500 flex items-center space-x-2 bg-red-50 p-3 rounded-lg border border-red-200">
                          <span>⚠️</span>
                          <span>Vui lòng nhập địa chỉ thực hiện</span>
                        </p>
                      )}
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

                    {/* Date & Time Information */}
                    {formData.preferredDate && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Thời gian thực hiện:</h4>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          {(() => {
                            try {
                              const date = new Date(formData.preferredDate);
                              return (
                                <>
                                  <p className="text-sm font-medium text-gray-900">
                                    {format(date, 'EEEE, dd MMMM yyyy', { locale: vi })}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Lúc {format(date, 'HH:mm', { locale: vi })}
                                  </p>
                                </>
                              );
                            } catch (error) {
                              return (
                                <p className="text-sm text-red-500">Lỗi định dạng thời gian</p>
                              );
                            }
                          })()}
                        </div>
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

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={
                        !!timeError || !formData.preferredDate || !selectedDate || !selectedTime
                      }
                    >
                      {timeError
                        ? 'Vui lòng chọn giờ hợp lệ'
                        : !formData.preferredDate
                          ? 'Vui lòng chọn ngày và giờ'
                          : 'Đặt lịch ngay'}
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
                  {formData.preferredDate
                    ? (() => {
                        try {
                          return format(new Date(formData.preferredDate), 'EEEE, dd/MM/yyyy', {
                            locale: vi,
                          });
                        } catch (error) {
                          return 'Lỗi định dạng ngày';
                        }
                      })()
                    : selectedDate
                      ? format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })
                      : 'Chưa chọn'}
                </p>
                <p>
                  <strong>Giờ:</strong>{' '}
                  {formData.preferredDate
                    ? (() => {
                        try {
                          return format(new Date(formData.preferredDate), 'HH:mm', { locale: vi });
                        } catch (error) {
                          return 'Lỗi định dạng giờ';
                        }
                      })()
                    : selectedTime || 'Chưa chọn'}
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
