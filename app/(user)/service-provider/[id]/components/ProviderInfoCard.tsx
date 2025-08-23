'use client';

import { Building2, MapPin, Phone, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/utils/numbers/formatDate';

interface ProviderInfoCardProps {
  providerData: {
    user: {
      id: number;
      name: string;
      email: string;
      phone: string;
      status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string;
      avatar: string | null;
      createdById: number | null;
      updatedById: number | null;
      createdAt: string;
      updatedAt: string;
    };
    serviceProvider: {
      id: number;
      description: string;
      address: string;
      companyType: string;
      industry: string | null;
      licenseNo: string | null;
      logo: string | null;
      taxId: string;
      verificationStatus: string;
      verifiedAt: string;
      verifiedById: number | null;
      userId: number;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export default function ProviderInfoCard({ providerData }: ProviderInfoCardProps) {
  const getCompanyInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();

  return (
    <div className="overflow-hidden">
      {/* Profile Header */}
      <CardHeader className="pb-6">
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-xl font-semibold bg-muted">
              {getCompanyInitials(providerData.user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">{providerData.user.name}</h2>
            <p className="text-sm text-muted-foreground">
              {providerData.serviceProvider.companyType}
            </p>
            <div className="text-xs text-muted-foreground/80 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              {providerData.serviceProvider.verificationStatus}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Profile Details */}
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            <h3 className="text-base font-medium">Thông tin liên hệ</h3>
            <div className="space-y-4">
              <DetailItem
                icon={<Mail className="w-5 h-5 text-muted-foreground" />}
                label="Email"
                value={providerData.user.email}
              />
              <DetailItem
                icon={<Phone className="w-5 h-5 text-muted-foreground" />}
                label="Số điện thoại"
                value={providerData.user.phone}
              />
              <DetailItem
                icon={<MapPin className="w-5 h-5 text-muted-foreground" />}
                label="Địa chỉ kinh doanh"
                value={providerData.serviceProvider.address}
              />
            </div>
          </div>

          {/* Company Info */}
          <div className="space-y-5">
            <h3 className="text-base font-medium">Thông tin công ty</h3>
            <div className="space-y-4">
              <DetailItem
                icon={<Building2 className="w-5 h-5 text-muted-foreground" />}
                label="Loại hình công ty"
                value={providerData.serviceProvider.companyType}
              />
              <DetailItem
                icon={<Calendar className="w-5 h-5 text-muted-foreground" />}
                label="Ngày xác minh"
                value={formatDate(providerData.serviceProvider.verifiedAt)}
              />
              {providerData.serviceProvider.taxId && (
                <DetailItem
                  icon={<ShieldCheck className="w-5 h-5 text-muted-foreground" />}
                  label="Mã số thuế"
                  value={providerData.serviceProvider.taxId}
                />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}

/* Subcomponent for repeated detail rows */
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start space-x-3">
      {icon}
      <div className="space-y-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
      </div>
    </div>
  );
}
