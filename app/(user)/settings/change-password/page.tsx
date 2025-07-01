'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// ✅ Schema validation
const formSchema = z
  .object({
    currentPassword: z.string().min(6, 'Ít nhất 6 ký tự'),
    newPassword: z.string().min(6, 'Ít nhất 6 ký tự'),
    confirmNewPassword: z.string().min(6, 'Ít nhất 6 ký tự'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu mới không khớp',
    path: ['confirmNewPassword'],
  });

type FormData = z.infer<typeof formSchema>;

export default function ChangePasswordPage() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  // TODO: Implement change password API call
  const onSubmit = (data: FormData) => {
    console.log('Submitted:', data);
    // Gọi API đổi mật khẩu ở đây
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu hiện tại</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nhập mật khẩu hiện tại" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu mới</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nhập mật khẩu mới" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhập lại mật khẩu mới</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nhập lại mật khẩu mới" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full">
                Lưu thay đổi
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
