'use client';

import { Company, CompanyType, VerificationStatus } from '@/lib/api/services/fetchManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, MapPin, Calendar } from 'lucide-react';
import { useChangeStatusProvider } from '@/hooks/useManager';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
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
import Image from 'next/image';

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const { mutate: changeStatus, isPending } = useChangeStatusProvider();

  const typeLabelMap: Record<CompanyType, string> = {
    [CompanyType.SOLE_PROPRIETORSHIP]: 'Doanh nghiệp tư nhân',
    [CompanyType.LIMITED_LIABILITY]: 'Công ty TNHH',
    [CompanyType.JOINT_STOCK]: 'Công ty cổ phần',
    [CompanyType.PARTNERSHIP]: 'Công ty hợp danh',
    [CompanyType.OTHER]: 'Khác',
  };

  const statusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return (
          <Badge className="bg-green-500 hover:bg-green-600 backdrop-blur-sm z-10">Đã duyệt</Badge>
        );
      case VerificationStatus.REJECTED:
        return <Badge className="bg-red-500 hover:bg-red-600 backdrop-blur-sm z-10">Từ chối</Badge>;
      default:
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 backdrop-blur-sm z-10">Chờ duyệt</Badge>
        );
    }
  };

  const handleApprove = () => {
    changeStatus({ id: company.id, verificationStatus: VerificationStatus.VERIFIED });
  };

  const handleReject = () => {
    changeStatus({ id: company.id, verificationStatus: VerificationStatus.REJECTED });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Image/Logo placeholder area */}
      <div className="relative aspect-square size-full mb-4 group">
        <div className="relative w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
          <Image
            src={company.logo ?? '/images/logo.png'}
            width={120}
            height={120}
            alt={company.user.name}
            className="object-cover rounded-xl"
          />
        </div>
        {/* Badges overlay */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 max-w-[calc(100%-1.5rem)]">
          <Badge variant="outline" className="text-xs backdrop-blur-sm">
            {typeLabelMap[company.companyType]}
          </Badge>
          {statusBadge(company.verificationStatus)}
        </div>
      </div>

      {/* Content */}
      <div className="px-1 flex-1 flex flex-col">
        <div className="mb-3 min-h-[3rem]">
          <h3 className="text-base font-medium line-clamp-2 leading-tight">{company.user.name}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="line-clamp-1">{company.address || 'Chưa cập nhật địa chỉ'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Calendar className="h-3 w-3 flex-shrink-0" />
          <span>Ngày tạo: {format(new Date(company.createdAt), 'dd/MM/yyyy', { locale: vi })}</span>
        </div>

        {/* Actions when PENDING - always render to maintain consistent height */}
        <div className="mt-auto">
          {company.verificationStatus === VerificationStatus.PENDING ? (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    className="flex-1 border-gray-300 text-black hover:bg-gray-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Duyệt
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận duyệt</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn duyệt công ty {company.user.name} ?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleApprove}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Duyệt
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isPending} className="flex-1">
                    <XCircle className="h-4 w-4 mr-2" /> Từ chối
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận từ chối</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn từ chối công ty {company.user.name} ?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReject}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Từ chối
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="h-[40px] flex items-center justify-center">
              <Badge variant="secondary" className="text-xs px-3 py-1">
                {company.verificationStatus === VerificationStatus.VERIFIED
                  ? 'Đã được duyệt'
                  : 'Đã bị từ chối'}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
