import { CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProviderType } from '@/schemaValidations/provider.schema';
import { UserType } from '@/schemaValidations/user.schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getNameFallback } from '@/utils/helper';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { Service } from '@/lib/api/services/fetchService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthDialog } from '@/components/ui/auth-dialog';

interface ProviderInfoProps {
  providerProfile: {
    user: UserType;
    serviceProvider: ProviderType;
  };
  service?: Service; // Add service prop to show price and details
}

export default function ProviderInfo({ providerProfile, service }: ProviderInfoProps) {
  const { user, serviceProvider } = providerProfile;
  const initials = getNameFallback(user.name || 'User');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      setAuthDialogOpen(true);
      return;
    }
    if (service?.id) {
      router.push(`/booking/${service.id}`);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white sticky top-24">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm text-muted-foreground font-normal">Giá dịch vụ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Price */}
        {service && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="flex items-end">
                <div className="text-2xl md:text-3xl font-medium text-foreground">
                  {formatCurrency(service.basePrice)}
                </div>
                {/* {service.basePrice > service.virtualPrice && (
                <div className="text-2xl md:text-3xl font-medium mb-2 text-foreground">
                  {formatCurrency(service.virtualPrice)}
                </div>
              )} */}
                <div className="text-sm text-muted-foreground">/{service.durationMinutes} phút</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={handleBookingClick}
            disabled={!service?.id}
          >
            <CalendarCheck className="w-4 h-4 mr-2" />
            Đặt lịch hẹn
          </Button>
        </div>

        {/* Auth Dialog */}
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />

        {/* Provider Info */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold text-sm mb-2">Nhà cung cấp dịch vụ</h4>
          <Link
            href={`/service-provider/${serviceProvider?.id}`}
            className="block group focus:outline-none focus:ring-2 focus:ring-primary/60 rounded-lg transition-shadow"
            tabIndex={0}
            aria-label={`Xem thông tin nhà cung cấp dịch vụ ${user.name}`}
          >
            <div className="flex items-center gap-4 p-3 rounded-lg border border-muted bg-muted/30 hover:bg-primary/5 group-hover:shadow-md transition-all">
              <Avatar className="w-14 h-14 border-2 border-primary/30 shadow-sm">
                <AvatarImage src={serviceProvider?.logo || ''} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
                  {user.name}
                </h3>
                <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"
                    aria-label="Đã xác thực"
                  ></span>
                  Chuyên gia được chứng nhận
                </p>
              </div>
              <span className="ml-2 text-primary group-hover:translate-x-1 transition-transform">
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </span>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
