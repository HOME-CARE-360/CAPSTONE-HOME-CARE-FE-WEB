'use client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUserProfile } from '@/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getNameFallback } from '@/utils/helper';

export default function ProfilePage() {
  const { data: profile, error } = useUserProfile();
  console.log('Profile: ', profile);
  const [dateOfBirth, setDateOfBirth] = useState(
    profile?.data?.customer.dateOfBirth ? new Date(profile?.data.customer.dateOfBirth) : undefined
  );

  console.log('error: ', error);
  console.log('Profile: ', profile);

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Chọn ngày sinh';
    return format(date, 'dd/MM/yyyy', { locale: vi });
  };

  return (
    <div className="">
      <Card>
        <CardHeader>
          <CardTitle>Hồ Sơ Của Tôi</CardTitle>
          <p className="text-sm text-muted-foreground">
            Quản lý thông tin hồ sơ để bảo mật tài khoản
          </p>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info Form */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <Label htmlFor="name">Tên</Label>
              <Input id="name" value={profile?.data?.user.name} />
            </div>

            <div>
              <Label>Email</Label>
              <div className="flex gap-2">
                <Input disabled value={profile?.data?.user.email} />
                {/* <Button variant="outline" size="sm">
                  Thay đổi
                </Button> */}
              </div>
            </div>

            <div>
              <Label>Số điện thoại</Label>
              <div className="flex gap-2">
                <Input disabled value={profile?.data?.user.phone} />
                <Button variant="outline" size="sm">
                  Thay đổi
                </Button>
              </div>
            </div>

            <div>
              <Label>Giới tính</Label>
              <RadioGroup
                defaultValue={profile?.data?.customer.gender || 'other'}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Nam</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Nữ</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Khác</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Ngày sinh</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateOfBirth && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(dateOfBirth)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateOfBirth}
                      onSelect={setDateOfBirth}
                      disabled={date => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="sm">
                  Thay đổi
                </Button>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            {/* <div className="size-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold"> */}
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.data?.user.avatar || 'https://github.com/shadcn.png'} />
              <AvatarFallback>{getNameFallback(profile?.data?.user.name || 'User')}</AvatarFallback>
            </Avatar>
            {/* </div> */}
            <Button variant="outline" size="sm">
              Chọn Ảnh
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Dung lượng tối đa 1MB. Định dạng JPEG, PNG
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button>Lưu</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
