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
  MapPin,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useService } from '@/hooks/useService';
import { useGetServiceProviderInformation, useGetSystemConfigs } from '@/hooks/useUser';
import { CreateBookingRequest } from '@/lib/api/services/fetchBooking';
import { useCreateBooking } from '@/hooks/useBooking';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import wardData from '@/ward.json';

// Type-safe helpers
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getServiceCategoryName(service: unknown): string {
  if (!isRecord(service)) return '';
  const directName = service['categoryName'];
  if (typeof directName === 'string' && directName.trim()) return directName;
  const category = service['Category'];
  if (isRecord(category) && typeof category['name'] === 'string') return category['name'];
  if (Array.isArray(category) && category.length > 0) {
    const first = category[0];
    if (isRecord(first) && typeof first['name'] === 'string') return first['name'];
  }
  return '';
}

function getServiceCategoryId(service: unknown): number {
  if (!isRecord(service)) return 0;
  const directId = service['categoryId'];
  if (typeof directId === 'number' && !Number.isNaN(directId)) return directId;
  const category = service['Category'];
  if (isRecord(category) && typeof category['id'] === 'number') return category['id'];
  if (Array.isArray(category) && category.length > 0) {
    const first = category[0];
    if (isRecord(first) && typeof first['id'] === 'number') return first['id'];
  }
  return 0;
}

// Skeleton Components
const ServiceInfoSkeleton = () => (
  <Card className="shadow-sm border-0">
    <CardHeader className="pb-6">
      <CardTitle className="flex items-center gap-3 text-xl">
        <div className="p-2 rounded-lg bg-muted">
          <Wrench className="h-6 w-6 text-muted-foreground" />
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
        <div className="p-2 rounded-lg bg-muted">
          <User className="h-6 w-6 text-muted-foreground" />
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
        <div className="p-2 rounded-lg bg-muted">
          <CalendarIcon className="h-6 w-6 text-muted-foreground" />
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
        <div className="p-2 rounded-lg bg-muted">
          <CreditCard className="h-6 w-6 text-muted-foreground" />
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
        <div className="p-2 rounded-lg bg-muted">
          <FileText className="h-6 w-6 text-muted-foreground" />
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
        <div className="p-2 rounded-lg bg-muted">
          <CheckCircle className="h-6 w-6 text-muted-foreground" />
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
    value: 'WALLET' as const,
    label: 'Thanh toán ví',
    description: 'Thanh toán bằng ví',
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
  const { data: serviceData, isLoading: isServiceLoading } = useService(serviceId as string);
  const serviceProviderId = serviceData?.service?.providerId
    ? Number(serviceData.service.providerId)
    : 0;
  const { data: profileProvider, isLoading: isProviderLoading } =
    useGetServiceProviderInformation(serviceProviderId);
  const { data: systemConfigs, isLoading: isSystemConfigsLoading } = useGetSystemConfigs({
    page: 1,
    limit: 20,
  });
  const { mutateAsync: createBooking } = useCreateBooking();

  // Check if any critical data is still loading
  const isDataLoading =
    isProfileLoading || isServiceLoading || isProviderLoading || isSystemConfigsLoading;

  // Get booking deposit from system configs
  // const bookingDeposit = useMemo(() => {
  //   if (!systemConfigs?.data?.items) return 30000; // fallback value
  //   const depositConfig = systemConfigs.data.items.find(config => config.key === 'BOOKING_DEPOSIT');
  //   return depositConfig ? parseInt(depositConfig.value, 10) : 30000;
  // }, [systemConfigs]);

  // Location state - simplified for districts only
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [districtSearchTerm, setDistrictSearchTerm] = useState<string>('');

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

  // Derive category display name from service data
  const categoryName = useMemo(() => getServiceCategoryName(serviceData?.service), [serviceData]);

  // Get districts from local ward.json
  const districts = useMemo(() => {
    return wardData.districts.map(district => ({
      name: district.name,
      type: district.type,
    }));
  }, []);

  // Filter districts based on search
  const filteredDistricts = useMemo(() => {
    if (!districtSearchTerm) return districts;
    return districts.filter(district =>
      district.name.toLowerCase().includes(districtSearchTerm.toLowerCase())
    );
  }, [districts, districtSearchTerm]);

  // Update full address when district or detailed address changes
  const fullAddress = useMemo(() => {
    const addressParts = [formData.location?.trim(), selectedDistrict, wardData.city].filter(
      Boolean
    );

    return addressParts.join(', ');
  }, [selectedDistrict, formData.location]);

  // Update location when district changes - but keep the detailed address
  useEffect(() => {
    // Don't override the user's detailed address input
    // The full address will be computed from fullAddress memo above
  }, [selectedDistrict, wardData]);

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

  // Update providerId and categoryId when service data is loaded
  useEffect(() => {
    if (serviceData?.service?.providerId) {
      const serviceCategoryId = getServiceCategoryId(serviceData.service);
      setFormData(prev => ({
        ...prev,
        providerId: serviceData.service.providerId,
        categoryId: serviceCategoryId,
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

      // Check if selected date is today and time is in the past or too soon
      if (selectedDate) {
        const currentDate = new Date();
        const isToday = selectedDate.toDateString() === currentDate.toDateString();

        if (isToday) {
          const currentTimeInMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();

          // Calculate minimum booking time (current time + 1 hour 30 minutes)
          const minBookingTimeInMinutes = currentTimeInMinutes + 90;

          if (timeInMinutes < minBookingTimeInMinutes) {
            const nextAvailableHour = Math.max(currentDate.getHours() + 1, 7);
            const nextAvailableMinute = currentDate.getMinutes() + 30;

            // Handle minute overflow for display
            let displayHour = nextAvailableHour;
            let displayMinute = nextAvailableMinute;
            if (displayMinute >= 60) {
              displayHour += 1;
              displayMinute = displayMinute - 60;
            }

            if (displayHour >= 19) {
              setTimeError('Không thể đặt lịch hôm nay. Vui lòng chọn ngày mai');
            } else {
              const formattedNextHour = displayHour.toString().padStart(2, '0');
              const formattedNextMinute = displayMinute.toString().padStart(2, '0');
              setTimeError(
                `Vui lòng đặt lịch ít nhất 1 tiếng 30 phút trước. Giờ sớm nhất: ${formattedNextHour}:${formattedNextMinute}`
              );
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

    // Validate detailed address is required
    if (!formData.location?.trim()) newErrors.location = '';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = '';

    setErrors(newErrors);

    // Validate time separately
    const isTimeValid = validateTime(selectedTime);

    // Also check if district is selected
    const hasRequiredLocation = selectedDistrict && formData.location?.trim();

    return Object.keys(newErrors).length === 0 && isTimeValid && !!hasRequiredLocation;
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
      // Create booking request with full address
      const bookingRequest = {
        ...formData,
        location: fullAddress, // Use the computed full address
      };

      const response = await createBooking(bookingRequest);

      // Show success message with booking ID
      // toast.success('Đặt lịch thành công!', {
      //   description: `Mã đặt lịch: BK${response.data}`,
      //   duration: 5000,
      // });

      // Check if response has checkout URL for payment
      if (response.data && 'checkoutUrl' in response.data && response.data.checkoutUrl) {
        window.open(response.data.checkoutUrl, '_blank');
        toast.info('Đang mở trang thanh toán...', {
          description: 'Vui lòng hoàn tất thanh toán để xác nhận đặt lịch',
          duration: 5000,
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
      setSelectedDistrict('');
      setDistrictSearchTerm('');
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
      <div className="h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Gửi yêu cầu dịch vụ</h1>
              <p className="text-muted-foreground text-lg">Hoàn tất thông tin để gửi yêu cầu</p>
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
            <h1 className="text-4xl font-bold mb-4">Gửi yêu cầu dịch vụ</h1>
            <p className="text-muted-foreground text-lg">
              Hoàn tất thông tin để gửi yêu cầu dịch vụ của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Form Fields */}
              <div className="lg:col-span-2 space-y-8">
                {/* Category Information (no service details) */}
                <Card className="shadow-sm border-0">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Wrench className="h-6 w-6 text-primary" />
                      </div>
                      <span>Danh mục yêu cầu dịch vụ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-6">
                      <Image
                        src={serviceData?.service?.Category?.logo || '/default-category-icon.png'}
                        alt={categoryName}
                        width={100}
                        height={50}
                        className="object-cover rounded-lg"
                      />
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-sm px-3 py-1">
                            {categoryName || 'Danh mục'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Yêu cầu sẽ được xử lý theo danh mục đã chọn của nhà cung cấp.
                        </p>
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

                      {/* City Display */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Thành phố
                        </Label>
                        <div className="p-3 bg-muted/30 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-medium">{wardData.city}</span>
                            <Badge variant="secondary" className="text-xs">
                              {wardData.type}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* District Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Quận/Huyện
                        </Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Tìm kiếm quận/huyện..."
                            value={districtSearchTerm}
                            onChange={e => setDistrictSearchTerm(e.target.value)}
                            className="h-12 pl-10"
                          />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {filteredDistricts.map((district, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedDistrict(district.name)}
                              className={`h-10 px-3 text-sm text-left rounded-lg border transition-colors ${
                                selectedDistrict === district.name
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background hover:bg-muted border-border'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <span className="truncate">{district.name}</span>
                                <Badge variant="outline" className="text-xs ml-auto">
                                  {district.type}
                                </Badge>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Detailed Address Input */}
                      <div className="space-y-3">
                        <Label htmlFor="detailedAddress" className="text-sm font-medium">
                          Địa chỉ chi tiết <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="detailedAddress"
                            value={formData.location}
                            onChange={e =>
                              setFormData(prev => ({ ...prev, location: e.target.value }))
                            }
                            placeholder="Nhập số nhà, tên đường, địa chỉ cụ thể..."
                            className={`h-12 pl-10 ${errors.location ? 'border-destructive' : ''}`}
                          />
                        </div>
                        {errors.location && (
                          <p className="text-sm text-destructive flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Vui lòng nhập địa chỉ chi tiết
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Vui lòng nhập địa chỉ cụ thể để nhân viên có thể tìm đến dễ dàng
                        </p>
                      </div>

                      {/* Full Address Preview */}
                      {(selectedDistrict || formData.location) && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-800">Địa chỉ đầy đủ:</p>
                              <p className="text-sm text-blue-700">
                                {[formData.location, selectedDistrict, wardData.city]
                                  .filter(Boolean)
                                  .join(', ') || 'Đang hoàn thiện thông tin địa chỉ...'}
                              </p>
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
                              <div className="flex-1">
                                <p className="font-medium">{method.label}</p>
                                <p className="text-sm text-muted-foreground">
                                  {method.description}
                                </p>
                                {method.value === 'WALLET' && profifeData?.data?.user?.wallet && (
                                  <div className="mt-2 p-2 bg-muted/50 rounded-md">
                                    <p className="text-sm font-medium text-muted-foreground">
                                      Số dư ví:{' '}
                                      <span className="text-primary font-semibold">
                                        {formatCurrency(profifeData.data.user.wallet.balance)}
                                      </span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                    <div className="mt-4 p-4 rounded-lg bg-muted/30 border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Số tiền khảo sát</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            systemConfigs?.data.items.find(
                              config => config.key === 'BOOKING_DEPOSIT'
                            )?.value
                              ? parseInt(
                                  systemConfigs?.data.items.find(
                                    config => config.key === 'BOOKING_DEPOSIT'
                                  )?.value || '30000',
                                  10
                                )
                              : 30000
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Số tiền này dùng để xác nhận yêu cầu. Giá cuối cùng sẽ hiển thị sau khi khảo
                        sát.
                      </p>
                    </div>
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
              <div className="space-y-6 w-fit">
                <Card className="sticky top-24 shadow-lg border-0">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <span>Tóm tắt yêu cầu đặt dịch vụ</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Category Summary (no service details) */}
                    {categoryName && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Danh mục</h4>
                        <div className="flex items-center gap-3">
                          <Image
                            src={
                              serviceData?.service?.Category?.logo || '/default-category-icon.png'
                            }
                            alt={categoryName}
                            width={50}
                            height={50}
                            className="object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium">{categoryName}</p>
                            <p className="text-sm text-muted-foreground">
                              Thuộc nhà cung cấp đã chọn
                            </p>
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
                        <h4 className="font-semibold text-sm">Thời gian thực hiện</h4>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          {(() => {
                            try {
                              const date = new Date(formData.preferredDate);
                              return (
                                <div className="space-y-2">
                                  <p className="font-medium text-sm">
                                    {format(date, 'EEEE, dd MMMM yyyy', { locale: vi })}
                                  </p>
                                  <p className="text-muted-foreground text-sm">
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
                    {fullAddress && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Địa chỉ</h4>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm text-muted-foreground">{fullAddress}</p>
                        </div>
                      </div>
                    )}

                    {/* Payment Summary */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm">Thanh toán</h4>
                      <p className="text-sm text-muted-foreground">
                        {paymentMethods.find(m => m.value === formData.paymentMethod)?.label}
                      </p>
                    </div>

                    {/* Price Information */}
                    {serviceData?.service?.basePrice && (
                      <div className="pt-6 border-t space-y-2">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span>Giá khởi điểm (dự kiến):</span>
                          <span className="text-primary">
                            {formatCurrency(
                              (serviceData.service.virtualPrice ?? 0) > 0
                                ? serviceData.service.virtualPrice
                                : (serviceData.service.basePrice ?? 0)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Tiền khảo sát</span>
                          <span className="font-semibold">
                            {formatCurrency(
                              systemConfigs?.data.items.find(
                                config => config.key === 'BOOKING_DEPOSIT'
                              )?.value
                                ? parseInt(
                                    systemConfigs?.data.items.find(
                                      config => config.key === 'BOOKING_DEPOSIT'
                                    )?.value || '30000',
                                    10
                                  )
                                : 30000
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          *Giá cuối cùng sẽ được xác nhận sau khi khảo sát
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-semibold"
                      disabled={
                        !!timeError ||
                        !formData.preferredDate ||
                        !selectedDate ||
                        !selectedTime ||
                        !selectedDistrict ||
                        !formData.location?.trim()
                      }
                    >
                      {timeError
                        ? 'Vui lòng chọn giờ hợp lệ'
                        : !formData.preferredDate
                          ? 'Vui lòng chọn ngày và giờ'
                          : !selectedDistrict
                            ? 'Vui lòng chọn quận/huyện'
                            : !formData.location?.trim()
                              ? 'Vui lòng nhập địa chỉ chi tiết'
                              : 'Gửi yêu cầu'}
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
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 shadow-2xl">
          {/* Header */}
          <div className="px-8 py-6 border-b bg-gradient-to-r from-background to-muted/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Xác nhận yêu cầu</h2>
                <p className="text-muted-foreground">Vui lòng kiểm tra thông tin trước khi gửi</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-8">
            {/* Service Overview */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border">
              <Image
                src={serviceData?.service?.Category?.logo || '/default-category-icon.png'}
                alt={categoryName}
                width={50}
                height={50}
                className="object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{categoryName}</h3>
                <p className="text-sm text-muted-foreground">
                  Nhà cung cấp: {profileProvider?.data?.user?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Đặt cọc</p>
                <span className="font-semibold">
                  {formatCurrency(
                    systemConfigs?.data.items.find(config => config.key === 'BOOKING_DEPOSIT')
                      ?.value
                      ? parseInt(
                          systemConfigs?.data.items.find(config => config.key === 'BOOKING_DEPOSIT')
                            ?.value || '30000',
                          10
                        )
                      : 30000
                  )}
                </span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Thông tin liên hệ
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Số điện thoại</span>
                    <span className="font-medium text-sm">
                      {formData.phoneNumber || 'Chưa nhập'}
                    </span>
                  </div>
                </div>

                <h4 className="font-semibold text-base flex items-center gap-2 pt-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  Địa điểm
                </h4>
                <div className="space-y-2 pl-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {fullAddress || 'Chưa nhập đầy đủ'}
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Thời gian
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ngày</span>
                    <span className="font-medium text-sm">
                      {formData.preferredDate
                        ? (() => {
                            try {
                              return format(new Date(formData.preferredDate), 'dd/MM/yyyy', {
                                locale: vi,
                              });
                            } catch {
                              return 'Lỗi định dạng ngày';
                            }
                          })()
                        : 'Chưa chọn'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Giờ</span>
                    <span className="font-medium text-sm">
                      {formData.preferredDate
                        ? (() => {
                            try {
                              return format(new Date(formData.preferredDate), 'HH:mm', {
                                locale: vi,
                              });
                            } catch {
                              return 'Lỗi định dạng giờ';
                            }
                          })()
                        : 'Chưa chọn'}
                    </span>
                  </div>
                </div>

                <h4 className="font-semibold text-base flex items-center gap-2 pt-4">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Thanh toán
                </h4>
                <div className="space-y-2 pl-6">
                  <p className="text-sm font-medium">
                    {paymentMethods.find(m => m.value === formData.paymentMethod)?.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {formData.note && (
              <div className="space-y-3">
                <h4 className="font-semibold text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Ghi chú
                </h4>
                <div className="pl-6">
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    {formData.note}
                  </p>
                </div>
              </div>
            )}

            {/* Important Notice */}
            <div className="p-4 rounded-xl border-2 border-dashed border-muted-foreground/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • Tiền đặt cọc{' '}
                      {formatCurrency(
                        systemConfigs?.data.items.find(config => config.key === 'BOOKING_DEPOSIT')
                          ?.value
                          ? parseInt(
                              systemConfigs?.data.items.find(
                                config => config.key === 'BOOKING_DEPOSIT'
                              )?.value || '30000',
                              10
                            )
                          : 30000
                      )}{' '}
                      để xác nhận yêu cầu
                    </li>
                    <li>• Giá cuối cùng sẽ được thông báo sau khi khảo sát</li>
                    <li>• Nhân viên sẽ liên hệ trong vòng 24h</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 bg-muted/20 border-t">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                className="flex-1 h-12 text-base font-medium"
              >
                Kiểm tra lại
              </Button>
              <Button
                onClick={confirmBooking}
                className="flex-1 h-12 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Xác nhận gửi yêu cầu
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
