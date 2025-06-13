'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const contractTypes = [
  'Cư trú và có HĐLĐ từ 3 tháng trở lên',
  'Cư trú và có HĐLĐ dưới 3 tháng',
  'Không cư trú',
];

const staffSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã nhân viên'),
  name: z.string().min(1, 'Vui lòng nhập tên nhân viên'),
  unit: z.string().min(1, 'Vui lòng nhập đơn vị'),
  dob: z.string().optional(),
  gender: z.enum(['male', 'female', '']).optional(),
  passport: z.string().optional(),
  idCard: z.string().optional(),
  idCardDate: z.string().optional(),
  idCardPlace: z.string().optional(),
  position: z.string().optional(),
  salary: z.coerce.number().min(0, 'Lương không hợp lệ').default(0),
  salaryCoef: z.coerce.number().default(0),
  insuranceSalary: z.coerce.number().min(0).default(0),
  taxCode: z.string().optional(),
  contractType: z.string().min(1, 'Vui lòng chọn loại hợp đồng'),
  dependentCount: z.coerce.number().min(0).default(0),
});

export type StaffFormData = z.infer<typeof staffSchema>;

interface StaffCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staffData: StaffFormData) => void;
}

export default function StaffCreateModal({ isOpen, onClose, onSubmit }: StaffCreateModalProps) {
  const [tab, setTab] = useState<'salary' | 'bank' | 'contact'>('salary');
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      code: '',
      name: '',
      unit: '',
      dob: '',
      gender: '',
      passport: '',
      idCard: '',
      idCardDate: '',
      idCardPlace: '',
      position: '',
      salary: 0,
      salaryCoef: 0,
      insuranceSalary: 0,
      taxCode: '',
      contractType: '',
      dependentCount: 0,
    },
  });

  const onSubmitForm = (data: StaffFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thông tin nhân viên</DialogTitle>
          <DialogDescription>Nhập đầy đủ thông tin nhân viên để thêm mới.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="code">Mã *</Label>
              <Controller
                name="code"
                control={control}
                render={({ field }) => <Input {...field} id="code" placeholder="Mã nhân viên" />}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <Label htmlFor="name">Tên *</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input {...field} id="name" placeholder="Tên nhân viên" />}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="unit">Đơn vị *</Label>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => <Input {...field} id="unit" placeholder="Đơn vị" />}
              />
              {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dob">Ngày sinh</Label>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => <Input {...field} id="dob" type="date" />}
              />
            </div>
            <div>
              <Label>Giới tính</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    className="flex flex-row gap-6 mt-2"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Nam</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Nữ</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            <div>
              <Label htmlFor="passport">Số hộ chiếu</Label>
              <Controller
                name="passport"
                control={control}
                render={({ field }) => <Input {...field} id="passport" placeholder="Số hộ chiếu" />}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="idCard">Số CMND/CCCD</Label>
              <Controller
                name="idCard"
                control={control}
                render={({ field }) => <Input {...field} id="idCard" placeholder="Số CMND/CCCD" />}
              />
            </div>
            <div>
              <Label htmlFor="idCardDate">Ngày cấp</Label>
              <Controller
                name="idCardDate"
                control={control}
                render={({ field }) => <Input {...field} id="idCardDate" type="date" />}
              />
            </div>
            <div>
              <Label htmlFor="idCardPlace">Nơi cấp</Label>
              <Controller
                name="idCardPlace"
                control={control}
                render={({ field }) => <Input {...field} id="idCardPlace" placeholder="Nơi cấp" />}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="position">Chức danh</Label>
            <Controller
              name="position"
              control={control}
              render={({ field }) => <Input {...field} id="position" placeholder="Chức danh" />}
            />
          </div>
          <Tabs
            value={tab}
            onValueChange={value => setTab(value as 'salary' | 'bank' | 'contact')}
            className="w-full"
          >
            <TabsList className="mb-2">
              <TabsTrigger value="salary">Thông tin tiền lương</TabsTrigger>
              <TabsTrigger value="bank">Tài khoản ngân hàng</TabsTrigger>
              <TabsTrigger value="contact">Thông tin liên hệ</TabsTrigger>
            </TabsList>
            <TabsContent value="salary">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salary">Lương thỏa thuận</Label>
                  <Controller
                    name="salary"
                    control={control}
                    render={({ field }) => <Input {...field} id="salary" type="number" min={0} />}
                  />
                  {errors.salary && (
                    <p className="text-red-500 text-sm mt-1">{errors.salary.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="salaryCoef">Hệ số lương</Label>
                  <Controller
                    name="salaryCoef"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} id="salaryCoef" type="number" step="0.01" />
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceSalary">Lương đóng bảo hiểm</Label>
                  <Controller
                    name="insuranceSalary"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} id="insuranceSalary" type="number" min={0} />
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="taxCode">Mã số thuế</Label>
                  <Controller
                    name="taxCode"
                    control={control}
                    render={({ field }) => <Input {...field} id="taxCode" />}
                  />
                </div>
                <div>
                  <Label htmlFor="contractType">Loại hợp đồng *</Label>
                  <Controller
                    name="contractType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="contractType">
                          <SelectValue placeholder="Chọn loại hợp đồng" />
                        </SelectTrigger>
                        <SelectContent>
                          {contractTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.contractType && (
                    <p className="text-red-500 text-sm mt-1">{errors.contractType.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="dependentCount">Số người phụ thuộc</Label>
                  <Controller
                    name="dependentCount"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} id="dependentCount" type="number" min={0} />
                    )}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="bank">
              <div className="p-4 text-gray-500">(Bổ sung trường tài khoản ngân hàng ở đây)</div>
            </TabsContent>
            <TabsContent value="contact">
              <div className="p-4 text-gray-500">(Bổ sung trường thông tin liên hệ ở đây)</div>
            </TabsContent>
          </Tabs>
          <DialogFooter className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Thêm</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
