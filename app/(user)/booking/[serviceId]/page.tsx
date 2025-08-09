'use client';

import { useUserProfile } from '@/hooks/useUser';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar24 } from '@/components/custom-date-picker';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CalendarIcon,
  User,
  CreditCard,
  Building2,
  FileText,
  CheckCircle,
  AlertCircle,
  Wrench,
  Clock,
  MapPin,
  Phone,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useService } from '@/hooks/useService';
import { useGetServiceProviderInformation } from '@/hooks/useUser';
import { useProvince, useProvinceCommunes } from '@/hooks/useProvince';
import { CreateBookingRequest } from '@/lib/api/services/fetchBooking';
import { useCreateBooking } from '@/hooks/useBooking';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton Components
const ServiceInfoSkeleton = () => (
  <Card className="shadow-sm border-0">
    <CardHeader className="pb-6">
      <CardTitle className="flex items-center gap-3 text-xl">
        <div className="p-2 rounded-lg bg-primary/10">
          <Wrench className="h-6 w-6 text-primary" />
        </div>
        <span>Thông tin dịch vụ</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-start gap-6">
        <Skeleton className="w-20 h-20 rounded-xl" />
        <div className="flex-1 space-y-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="h-8 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const CustomerInfoSkeleton = () => (
  <Card className="shadow-sm border-0">
    <CardHeader className="pb-6">
      <CardTitle className="flex items-center gap-3 text-xl">
        <div className="p-2 rounded-lg bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <span>Thông tin khách hàng</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DateTimeLocationSkeleton = () => (
  <Card className="shadow-sm border-0">
    <CardHeader className="pb-6">
      <CardTitle className="flex items-center gap-3 text-xl">
        <div className="p-2 rounded-lg bg-primary/10">
          <CalendarIcon className="h-6 w-6 text-primary" />
        </div>
        <span>Thời gian và địa điểm</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-4 w-40" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const PaymentMethodSkeleton = () => (
  <Card className="shadow-sm border-0">
    <CardHeader className="pb-6">
      <CardTitle className="flex items-center gap-3 text-xl">
        <div className="p-2 rounded-lg bg-primary/10">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        <span>Phương thức thanh toán</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4" />
            <div className="flex items-center gap-4 flex-1 p-4 rounded-lg border">
              <Skeleton className="h-5 w-5" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const NotesSkeleton = () => (
  <Card className="shadow-sm border-0">
    <CardHeader className="pb-6">
      <CardTitle className="flex items-center gap-3 text-xl">
        <div className="p-2 rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <span>Ghi chú bổ sung</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    </CardContent>
  </Card>
);

const BookingSummarySkeleton = () => (
  <Card className="sticky top-24 shadow-lg border-0">
    <CardHeader className="pb-6">
      <CardTitle className="flex items-center gap-3 text-xl">
        <div className="p-2 rounded-lg bg-primary/10">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
        <span>Tóm tắt đặt lịch</span>
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-16" />
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="bg-muted/30 p-4 rounded-lg">
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-16" />
        <div className="flex items-start gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Separator />
      <div className="space-y-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="pt-6 border-t">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-3 w-48 mt-2" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-3 w-64 mx-auto" />
    </CardContent>
  </Card>
);

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
  const { data: profifeData, isLoading: isProfileLoading } = useUserProfile();
  const params = useParams();
  const serviceId = params.serviceId;
  const { data: serviceData, isLoading: isServiceLoading } = useService(
    serviceId as unknown as string
  );
  const { data: profileProvider, isLoading: isProviderLoading } = useGetServiceProviderInformation(
    serviceData?.service?.providerId ? Number(serviceData.service.providerId) : 0
  );
  const { data: provinceData, isLoading: isProvinceLoading } = useProvince();
  const { mutateAsync: createBooking } = useCreateBooking();

  // Check if any critical data is still loading
  const isDataLoading = isProfileLoading || isServiceLoading || isProviderLoading;

  // Location state
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCommune, setSelectedCommune] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [communeSearchTerm, setCommuneSearchTerm] = useState<string>('');

  // Commune data hook - must be after selectedProvince state
  const { data: communeData, isLoading: isCommuneLoading } = useProvinceCommunes(selectedProvince);

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

  const provinces = useMemo(() => {
    if (!provinceData?.provinces) {
      return [];
    }

    const mappedProvinces = provinceData.provinces.map(province => ({
      code: province.code,
      name: province.name,
    }));

    return mappedProvinces;
  }, [provinceData]);

  // Get communes for selected province
  const communes = useMemo(() => {
    if (!selectedProvince || !communeData?.communes) return [];

    return communeData.communes.map(commune => ({
      code: commune.code,
      name: commune.name,
    }));
  }, [selectedProvince, communeData]);

  // Filter provinces based on search
  const filteredProvinces = useMemo(() => {
    if (!name) return provinces;
    return provinces.filter(province => province.name.toLowerCase().includes(name.toLowerCase()));
  }, [provinces, name]);

  // Filter communes based on search
  const filteredCommunes = useMemo(() => {
    if (!communeSearchTerm) return communes;
    return communes.filter(commune =>
      commune.name.toLowerCase().includes(communeSearchTerm.toLowerCase())
    );
  }, [communes, communeSearchTerm]);

  // Update location when province or commune changes
  useEffect(() => {
    const selectedProvinceName = provinces.find(p => p.code === selectedProvince)?.name;
    const selectedCommuneName = communes.find(c => c.code === selectedCommune)?.name;

    let location = '';
    if (selectedCommuneName && selectedProvinceName) {
      location = `${selectedCommuneName}, ${selectedProvinceName}`;
    } else if (selectedProvinceName) {
      location = selectedProvinceName;
    }

    setFormData(prev => ({ ...prev, location }));
  }, [selectedProvince, selectedCommune, provinces, communes]);

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

  const validateTime = useCallback(
    (timeStr: string): boolean => {
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
              setTimeError(`Vui lòng chọn từ ${nextAvailableHour}:00 trở đi`);
            }
            return false;
          }
        }
      }

      setTimeError('');
      return true;
    },
    [selectedDate]
  );

  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime);
    validateTime(newTime);
  };

  // Re-validate time when date changes (for today vs future date scenarios)
  useEffect(() => {
    if (selectedTime) {
      validateTime(selectedTime);
    }
  }, [selectedDate, selectedTime, validateTime]);

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
      const response = await createBooking(formData);

      // Show success message with booking ID
      toast.success('Đặt lịch thành công!', {
        description: `Mã đặt lịch: BK${response.data.bookingId}`,
        duration: 5000,
      });

      // If checkout URL is available, open it in a new tab
      if (response.data.responseData.checkoutUrl) {
        window.open(response.data.responseData.checkoutUrl, '_blank');
        toast.info('Đang mở trang thanh toán...', {
          description: 'Vui lòng hoàn tất thanh toán để xác nhận đặt lịch',
          duration: 3000,
        });
      }

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
      setSelectedProvince('');
      setSelectedCommune('');
      setName('');
      setCommuneSearchTerm('');
      setShowConfirmation(false);
    } catch (error) {
      // Error is handled by the hook with toast
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state if critical data is still loading
  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Đặt lịch dịch vụ</h1>
              <p className="text-muted-foreground text-lg">
                Hoàn tất thông tin để đặt lịch dịch vụ của bạn
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Form Fields */}
              <div className="lg:col-span-2 space-y-8">
                <ServiceInfoSkeleton />
                <CustomerInfoSkeleton />
                <DateTimeLocationSkeleton />
                <PaymentMethodSkeleton />
                <NotesSkeleton />
              </div>

              {/* Right Column - Booking Summary */}
              <div className="space-y-6">
                <BookingSummarySkeleton />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Đặt lịch dịch vụ</h1>
            <p className="text-muted-foreground text-lg">
              Hoàn tất thông tin để đặt lịch dịch vụ của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Form Fields */}
              <div className="lg:col-span-2 space-y-8">
                {/* Service Information */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Wrench className="h-6 w-6 text-primary" />
                      </div>
                      <span>Thông tin dịch vụ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                        <Wrench className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-2xl font-semibold mb-2">
                            {serviceData?.service?.name || ''}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {serviceData?.service?.description || 'Mô tả dịch vụ'}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-lg px-4 py-2">
                              {formatCurrency(serviceData?.service?.basePrice || 0)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{serviceData?.service?.durationMinutes || 0} phút</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-0">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <span>Thông tin khách hàng</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Họ và tên</Label>
                        <Input
                          value={profifeData?.data?.user?.name || ''}
                          disabled
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-sm font-medium">
                          Số điện thoại
                        </Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))
                          }
                          placeholder="Nhập số điện thoại"
                          className={`h-12 ${errors.phoneNumber ? 'border-destructive' : ''}`}
                        />
                        {errors.phoneNumber && (
                          <p className="text-sm text-destructive">Vui lòng nhập số điện thoại</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Date & Location */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CalendarIcon className="h-6 w-6 text-primary" />
                      </div>
                      <span>Thời gian và địa điểm</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Date & Time Selection */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Chọn ngày và giờ thực hiện</Label>
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
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Vui lòng chọn ngày thực hiện
                        </p>
                      )}
                      {timeError && (
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {timeError}
                        </p>
                      )}
                    </div>

                    {/* Location */}
                    <div className="space-y-6">
                      <Label className="text-sm font-medium">Địa chỉ thực hiện dịch vụ</Label>

                      {/* Province Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Tỉnh/Thành phố
                        </Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Tìm kiếm tỉnh/thành phố..."
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="h-12 pl-10"
                          />
                        </div>
                        {isProvinceLoading ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <Skeleton key={i} className="h-10 w-full" />
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {filteredProvinces.map(province => (
                              <button
                                key={province.code}
                                type="button"
                                onClick={() => {
                                  setSelectedProvince(province.code);
                                  setSelectedCommune(''); // Reset commune when province changes
                                  setCommuneSearchTerm('');
                                }}
                                className={`h-10 px-3 text-sm text-left rounded-lg border transition-colors ${
                                  selectedProvince === province.code
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background hover:bg-muted border-border'
                                }`}
                              >
                                {province.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Commune Selection */}
                      {selectedProvince && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-muted-foreground">
                            Quận/Huyện
                          </Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Tìm kiếm quận/huyện..."
                              value={communeSearchTerm}
                              onChange={e => setCommuneSearchTerm(e.target.value)}
                              className="h-12 pl-10"
                            />
                          </div>
                          {isCommuneLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full" />
                              ))}
                            </div>
                          ) : communes.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                              {filteredCommunes.map(commune => (
                                <button
                                  key={commune.code}
                                  type="button"
                                  onClick={() => setSelectedCommune(commune.code)}
                                  className={`h-10 px-3 text-sm text-left rounded-lg border transition-colors ${
                                    selectedCommune === commune.code
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-background hover:bg-muted border-border'
                                  }`}
                                >
                                  {commune.name}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-muted-foreground bg-muted/30 rounded-lg">
                              <p className="text-sm">Không có quận/huyện nào cho tỉnh này</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Detailed Address */}
                      <div className="space-y-3">
                        <Label
                          htmlFor="detailedAddress"
                          className="text-sm font-medium text-muted-foreground"
                        >
                          Địa chỉ chi tiết (số nhà, tên đường...)
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="detailedAddress"
                            value={formData.location}
                            onChange={e =>
                              setFormData(prev => ({ ...prev, location: e.target.value }))
                            }
                            placeholder="Nhập địa chỉ chi tiết..."
                            className={`h-12 pl-10 ${errors.location ? 'border-destructive' : ''}`}
                          />
                        </div>
                        {errors.location && (
                          <p className="text-sm text-destructive flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Vui lòng nhập địa chỉ thực hiện
                          </p>
                        )}
                      </div>

                      {/* Selected Location Display */}
                      {formData.location && (
                        <div className="p-4 bg-muted/30 rounded-lg border">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Địa chỉ đã chọn:</p>
                              <p className="text-sm text-muted-foreground">{formData.location}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
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
                      <div className="grid gap-4">
                        {paymentMethods.map(method => (
                          <div key={method.value} className="flex items-center space-x-4">
                            <RadioGroupItem value={method.value} id={method.value} />
                            <Label
                              htmlFor={method.value}
                              className="flex items-center gap-4 cursor-pointer flex-1 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                              {method.icon}
                              <div>
                                <p className="font-medium">{method.label}</p>
                                <p className="text-sm text-muted-foreground">
                                  {method.description}
                                </p>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <span>Ghi chú bổ sung</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Label htmlFor="note" className="text-sm font-medium">
                        Mô tả chi tiết hoặc yêu cầu đặc biệt
                      </Label>
                      <Textarea
                        id="note"
                        value={formData.note}
                        onChange={e => setFormData(prev => ({ ...prev, note: e.target.value }))}
                        placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu đặc biệt..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="space-y-6">
                <Card className="sticky top-24 shadow-lg border-0">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <span>Tóm tắt đặt lịch</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Service Summary */}
                    {serviceData?.service && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Dịch vụ</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Wrench className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium">{serviceData.service.name}</h5>
                              <p className="text-sm text-muted-foreground">
                                {serviceData.service.durationMinutes} phút
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Provider Summary */}
                    {profileProvider?.data && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Nhà cung cấp</h4>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={profileProvider.data.serviceProvider?.logo || ''} />
                            <AvatarFallback>
                              {profileProvider.data.user.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{profileProvider.data.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Chuyên gia được chứng nhận
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Date & Time Summary */}
                    {formData.preferredDate && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Thời gian thực hiện</h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          {(() => {
                            try {
                              const date = new Date(formData.preferredDate);
                              return (
                                <div className="space-y-2">
                                  <p className="font-medium">
                                    {format(date, 'EEEE, dd MMMM yyyy', { locale: vi })}
                                  </p>
                                  <p className="text-muted-foreground">
                                    Lúc {format(date, 'HH:mm', { locale: vi })}
                                  </p>
                                </div>
                              );
                            } catch (error) {
                              return (
                                <p className="text-sm text-destructive">Lỗi định dạng thời gian</p>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Location Summary */}
                    {formData.location && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Địa chỉ</h4>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm text-muted-foreground">{formData.location}</p>
                        </div>
                      </div>
                    )}

                    {/* Payment Summary */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg">Thanh toán</h4>
                      <p className="text-sm text-muted-foreground">
                        {paymentMethods.find(m => m.value === formData.paymentMethod)?.label}
                      </p>
                    </div>

                    {/* Price Information */}
                    {serviceData?.service?.basePrice && (
                      <div className="pt-6 border-t">
                        <div className="flex justify-between items-center text-2xl font-bold">
                          <span>Tổng cộng:</span>
                          <span className="text-primary">
                            {formatCurrency(serviceData.service.basePrice)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          *Giá cuối cùng sẽ được xác nhận sau khi khảo sát
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-semibold"
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

                    <p className="text-xs text-muted-foreground text-center">
                      Bằng cách đặt lịch, bạn đồng ý với{' '}
                      <Link href="/terms" className="text-primary hover:underline">
                        Điều khoản dịch vụ
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <div className="flex flex-col items-center justify-center bg-green-50 py-6 px-4 border-b">
            <CheckCircle
              className="h-10 w-10 text-green-600 mb-2 animate-bounce"
              aria-hidden="true"
            />
            <h2 className="text-2xl font-bold text-green-700 mb-1">Đặt lịch thành công?</h2>
            <p className="text-sm text-green-800">
              Vui lòng kiểm tra lại thông tin trước khi xác nhận
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Thông tin đặt lịch</h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground flex-1">Số điện thoại:</span>
                  <span className="font-medium">
                    {formData.phoneNumber || <span className="text-destructive">Chưa nhập</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground flex-1">Ngày:</span>
                  <span className="font-medium">
                    {formData.preferredDate ? (
                      (() => {
                        try {
                          return format(new Date(formData.preferredDate), 'dd/MM/yyyy', {
                            locale: vi,
                          });
                        } catch {
                          return <span className="text-destructive">Lỗi định dạng ngày</span>;
                        }
                      })()
                    ) : selectedDate ? (
                      format(selectedDate, 'dd/MM/yyyy', { locale: vi })
                    ) : (
                      <span className="text-destructive">Chưa chọn</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground flex-1">Giờ:</span>
                  <span className="font-medium">
                    {formData.preferredDate ? (
                      (() => {
                        try {
                          return format(new Date(formData.preferredDate), 'HH:mm', { locale: vi });
                        } catch {
                          return <span className="text-destructive">Lỗi định dạng giờ</span>;
                        }
                      })()
                    ) : selectedTime ? (
                      selectedTime
                    ) : (
                      <span className="text-destructive">Chưa chọn</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground flex-1">Địa chỉ:</span>
                  <span className="font-medium max-w-[200px] text-right truncate">
                    {formData.location || <span className="text-destructive">Chưa nhập</span>}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground flex-1">Thanh toán:</span>
                  <span className="font-medium">
                    {paymentMethods.find(m => m.value === formData.paymentMethod)?.label}
                  </span>
                </div>
              </div>
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" aria-hidden="true" />
              <AlertDescription className="text-yellow-800">
                Chúng tôi sẽ liên hệ với bạn trong vòng{' '}
                <span className="font-semibold">15 phút</span> để xác nhận lịch hẹn và báo giá chi
                tiết.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={confirmBooking}
                className="flex-1 h-12 text-lg font-semibold"
                disabled={isSubmitting}
                aria-label="Xác nhận đặt lịch"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary" />
                    Đang xử lý...
                  </span>
                ) : (
                  'Xác nhận đặt lịch'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                className="flex-1 h-12 text-lg"
                aria-label="Hủy xác nhận"
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
