'use client';
import { Service } from '@/lib/api/services/fetchService';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import {
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Shield,
  Award,
  Users,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGetProviderInfomation } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import ProviderInfo from '@/app/(user)/services/[id]/components/ProviderInfo';

interface ServiceDetailsSectionProps {
  service: Service;
}

export default function ServiceDetailsSection({ service }: ServiceDetailsSectionProps) {
  const isDiscounted = service.virtualPrice > service.basePrice;
  const discountPercent = isDiscounted
    ? Math.round(((service.virtualPrice - service.basePrice) / service.virtualPrice) * 100)
    : 0;

  const { data: profileProvider } = useGetProviderInfomation(service.providerId);
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-10">
        {/* Service Header */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {(service.category || []).map((category, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-gray-100 text-gray-700 border-gray-200 px-3 py-1"
              >
                <Tag className="w-3 h-3 mr-1" />
                {category.name}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            {service.name}
          </h1>

          <div className="flex items-center gap-8 text-gray-600 border-b border-gray-200 pb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium">Dịch vụ chuyên nghiệp</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium">{service.provider}</span>
            </div>
          </div>
        </div>

        {/* Service Description */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              Mô tả dịch vụ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-lg font-light">
              {service.description}
            </p>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              Thông tin chi tiết
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-14 h-14 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Thời gian thực hiện</p>
                  <p className="font-bold text-xl text-gray-900">{service.durationMinutes} phút</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-14 h-14 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Bảo hành</p>
                  <p className="font-bold text-xl text-gray-900">30 ngày</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-14 h-14 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center">
                  <Award className="w-7 h-7 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Chất lượng</p>
                  <p className="font-bold text-xl text-gray-900">Được xác minh</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-14 h-14 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Đội ngũ</p>
                  <p className="font-bold text-xl text-gray-900">Chuyên nghiệp</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        {service.category && service.category.length > 0 && (
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                Danh mục dịch vụ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.category.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                      <Tag className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize text-lg">
                        {category.name}
                      </p>
                      <p className="text-sm text-gray-500">Dịch vụ chuyên nghiệp</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Booking Sidebar */}
      <div className="space-y-8">
        {/* Price Card */}
        <Card className="border-2 border-gray-900 shadow-xl sticky top-8 bg-white">
          <CardHeader className="pb-6">
            <div className="space-y-3">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  {formatCurrency(service.basePrice)}
                </span>
                {isDiscounted && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {formatCurrency(service.virtualPrice)}
                    </span>
                    <Badge className="bg-gray-900 text-white px-2 py-1">-{discountPercent}%</Badge>
                  </>
                )}
              </div>
              <p className="text-gray-600 font-medium">
                {isDiscounted ? 'Giá ưu đãi' : 'Giá dịch vụ cố định'}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
                size="lg"
                onClick={() => router.push(`/booking/${service.id}`)}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Đặt lịch ngay
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-medium"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Gọi ngay
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-medium"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <span className="font-medium">Miễn phí hủy trong 24h</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <span className="font-medium">Thanh toán sau khi hoàn thành</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <span className="font-medium">Bảo hành 30 ngày</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <span className="font-medium">Hỗ trợ 24/7</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Info */}
        {profileProvider && <ProviderInfo providerProfile={profileProvider.data} />}
      </div>
    </div>
  );
}
