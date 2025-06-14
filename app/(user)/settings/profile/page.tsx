'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';

export default function ProfilePage() {
  const [profile] = useState({
    username: 'danh27032003',
    name: 'Cong Danh',
    email: 'ch*********@gmail.com',
    phone: '*******30',
    gender: 'male',
    birthYear: '2003',
  });

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
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input id="username" disabled value={profile.username} />
            </div>

            <div>
              <Label htmlFor="name">Tên</Label>
              <Input id="name" value={profile.name} />
            </div>

            <div>
              <Label>Email</Label>
              <div className="flex gap-2">
                <Input disabled value={profile.email} />
                <Button variant="outline" size="sm">
                  Thay đổi
                </Button>
              </div>
            </div>

            <div>
              <Label>Số điện thoại</Label>
              <div className="flex gap-2">
                <Input disabled value={profile.phone} />
                <Button variant="outline" size="sm">
                  Thay đổi
                </Button>
              </div>
            </div>

            <div>
              <Label>Giới tính</Label>
              <RadioGroup defaultValue={profile.gender} className="flex gap-4 mt-2">
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
                <Input type="text" value={`**/**/${profile.birthYear}`} />
                <Button variant="outline" size="sm">
                  Thay đổi
                </Button>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="size-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
              D
            </div>
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
