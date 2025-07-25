'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // dùng hàm cn nếu bạn có shadcn setup
import { Separator } from '@/components/ui/separator';

const accountItems = [
  { label: 'Hồ sơ', value: 'profile', href: '/settings/profile' },
  { label: 'Đổi mật khẩu', value: 'password', href: '/settings/change-password' },
];

const settingItems = [
  { label: 'Ngân hàng', value: 'bank', href: '/user/bank' },
  { label: 'Địa chỉ', value: 'address', href: '/user/address' },
  { label: 'Cài đặt thông báo', value: 'notifications', href: '/user/notifications' },
  { label: 'Thiết lập riêng tư', value: 'privacy', href: '/user/privacy' },
];

const notificationItems = [
  { label: 'Cập nhật ví', value: 'wallet', href: '/settings/notifications/wallet' },
  { label: 'Cập nhật đặt lịch', value: 'booking', href: '/settings/notifications/booking' },
];

export default function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full h-full bg-white ">
      <nav className="p-4 space-y-6">
        {/* Tài khoản cá nhân */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Tài khoản cá nhân</p>
          <ul className="space-y-1">
            {accountItems.map(item => (
              <SidebarLink key={item.value} href={item.href} active={pathname === item.href}>
                {item.label}
              </SidebarLink>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Cài đặt */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Cài đặt</p>
          <ul className="space-y-1">
            {settingItems.map(item => (
              <SidebarLink key={item.value} href={item.href} active={pathname === item.href}>
                {item.label}
              </SidebarLink>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Thông báo */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Thông báo</p>
          <ul className="space-y-1">
            {notificationItems.map(item => (
              <SidebarLink key={item.value} href={item.href} active={pathname === item.href}>
                {item.label}
              </SidebarLink>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

function SidebarLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
          active
            ? 'bg-green-50 text-green-600'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        )}
      >
        {children}
      </Link>
    </li>
  );
}
