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

interface ProviderInfoProps {
  providerProfile: {
    user: UserType;
    provider: ProviderType;
  };
  service?: Service; // Add service prop to show price and details
}

export default function ProviderInfo({ providerProfile, service }: ProviderInfoProps) {
  const { user, provider } = providerProfile;
  const initials = getNameFallback(user.name || 'User');
  const router = useRouter();

  const handleBookingClick = () => {
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

        {/* Provider Info */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold text-sm">Nhà cung cấp dịch vụ</h4>
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <Avatar className="w-12 h-12 border-2 border-primary/20">
              <AvatarImage src={provider?.logo || ''} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-sm">{user.name}</h3>
              <p className="text-muted-foreground text-xs">Chuyên gia được chứng nhận</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
