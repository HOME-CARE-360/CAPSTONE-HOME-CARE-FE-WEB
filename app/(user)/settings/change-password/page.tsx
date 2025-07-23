'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

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
import {
  ChangePasswordRequestType,
  changPasswordRequestSchema,
} from '@/schemaValidations/user.schema';
import { useChangePassword } from '@/hooks/useUser';

export default function ChangePasswordPage() {
  const form = useForm<ChangePasswordRequestType>({
    resolver: zodResolver(changPasswordRequestSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const changePasswordMutation = useChangePassword();

  // Handle API errors and set them to form fields
  useEffect(() => {
    if (changePasswordMutation.error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = changePasswordMutation.error as any;

      // Handle the specific error structure you're getting
      if (error?.response?.data?.details) {
        const details = error.response.data.details;

        if (details.path && Array.isArray(details.path) && details.message) {
          // Get the first path element (field name)
          const fieldName = details.path[0] as keyof ChangePasswordRequestType;

          if (
            fieldName &&
            ['currentPassword', 'newPassword', 'confirmNewPassword'].includes(fieldName)
          ) {
            form.setError(fieldName, {
              type: 'server',
              message: details.message,
            });
          }
        }
      }

      // Also handle the case where error message is directly in response.data
      if (error?.response?.data?.message && !error.response.data.details) {
        const errorMessage = error.response.data.message;

        if (Array.isArray(errorMessage)) {
          // Handle validation errors from API
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorMessage.forEach((err: any) => {
            if (err.path && err.message) {
              // Map API field names to form field names
              const fieldMap: Record<string, keyof ChangePasswordRequestType> = {
                currentPassword: 'currentPassword',
                newPassword: 'newPassword',
                confirmNewPassword: 'confirmNewPassword',
              };

              const fieldName = fieldMap[err.path];
              if (fieldName) {
                form.setError(fieldName, {
                  type: 'server',
                  message: err.message,
                });
              }
            }
          });
        }
      }
    }
  }, [changePasswordMutation.error, form]);

  const onSubmit = (data: ChangePasswordRequestType) => {
    // Clear any previous errors
    form.clearErrors();

    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmNewPassword,
    });
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
                      <Input
                        type="password"
                        placeholder="Nhập mật khẩu hiện tại"
                        {...field}
                        disabled={changePasswordMutation.isPending}
                      />
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
                      <Input
                        type="password"
                        placeholder="Nhập mật khẩu mới"
                        {...field}
                        disabled={changePasswordMutation.isPending}
                      />
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
                      <Input
                        type="password"
                        placeholder="Nhập lại mật khẩu mới"
                        {...field}
                        disabled={changePasswordMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? 'Đang xử lý...' : 'Lưu thay đổi'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
