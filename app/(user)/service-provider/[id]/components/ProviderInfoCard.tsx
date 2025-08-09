'use client';

import { Building2, MapPin, Phone, Mail, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'VERIFIED':
        return 'default';
      case 'ACTIVE':
        return 'secondary';
      case 'INACTIVE':
        return 'outline';
      case 'PENDING':
        return 'secondary';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold bg-muted">
                {getCompanyInitials(providerData.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div>
                <h2 className="text-2xl font-semibold leading-tight">{providerData.user.name}</h2>
                <p className="text-sm text-muted-foreground font-mono">
                  Hình thức công ty: {providerData.serviceProvider.companyType}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={getStatusVariant(providerData.serviceProvider.verificationStatus)}
                  className="font-medium"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {providerData.serviceProvider.verificationStatus}
                </Badge>
                <Badge variant={getStatusVariant(providerData.user.status)}>
                  {providerData.user.status === 'ACTIVE' ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <AlertCircle className="w-3 h-3 mr-1" />
                  )}
                  {providerData.user.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Thông tin liên hệ</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{providerData.user.email}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Số điện thoại</p>
                    <p className="text-sm text-muted-foreground">{providerData.user.phone}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Địa chỉ kinh doanh</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {providerData.serviceProvider.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Thông tin công ty</h3>
              <div className="space-y-4">
                {/* <div className="flex items-start space-x-3">
                  <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Mã số thuế</p>
                    <p className="text-sm text-muted-foreground font-mono">{providerData.serviceProvider.taxId}</p>
                  </div>
                </div> */}

                <div className="flex items-start space-x-3">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Loại hình công ty</p>
                    <p className="text-sm text-muted-foreground">
                      {providerData.serviceProvider.companyType}
                    </p>
                  </div>
                </div>

                {/* <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Ngành nghề</p>
                    <p className="text-sm text-muted-foreground">
                      {providerData.serviceProvider.industry || 'Chưa xác định'}
                    </p>
                  </div>
                </div> */}

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Ngày xác minh</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(providerData.serviceProvider.verifiedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
