import { Shield, Award, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProviderType } from '@/schemaValidations/provider.schema';
import { UserType } from '@/schemaValidations/user.schema';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getNameFallback } from '@/utils/helper';

interface ProviderInfoProps {
  providerProfile: {
    user: UserType;
    provider: ProviderType;
  };
}

export default function ProviderInfo({ providerProfile }: ProviderInfoProps) {
  const { user, provider } = providerProfile;

  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-gray-900">Nhà cung cấp</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          {/* <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {user.name}
          </div> */}
          <Avatar className="w-20 h-20 border-2 border-gray-200">
            <AvatarImage src={provider?.logo || ''} />
            <AvatarFallback>{getNameFallback(user.name || 'User')}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-lg text-gray-900">{user.name}</p>
            <p className="text-gray-600 font-medium">Nhà cung cấp dịch vụ</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Được xác minh</span>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Chuyên gia được chứng nhận</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700 font-medium">Đã phục vụ 1000+ khách hàng</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-medium"
        >
          Xem thông tin chi tiết
        </Button>
      </CardContent>
    </Card>
  );
}
