'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const accountItems = [
  { label: 'Hồ sơ', value: 'profile', href: '/settings/profile' },
  { label: 'Đổi mật khẩu', value: 'password', href: '/settings/change-password' },
];

const serviceItems = [
  { label: 'Tin nhắn', value: 'chat', href: '/settings/chat' },
  { label: 'Ngân hàng', value: 'bank', href: '/settings/bank' },
  { label: 'Gợi ý bảo trì tài sản', value: 'asset', href: '/settings/asset' },
  { label: 'Gợi ý sản phẩm', value: 'service', href: '/settings/service' },
  { label: 'Dịch vụ đã đặt', value: 'booking', href: '/settings/bookings' },
  { label: 'Dịch vụ yêu thích', value: 'favorites', href: '/settings/favorites' },
  { label: 'Báo cáo của bạn', value: 'report', href: '/settings/report' },
  { label: 'Đánh giá của bạn', value: 'review', href: '/settings/review' },
  { label: 'Giao dịch của bạn', value: 'transaction', href: '/settings/transaction' },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const NavigationContent = () => (
    <nav className="p-6 sm:p-6 space-y-4 sm:space-y-6">
      {/* Tài khoản cá nhân */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-3 px-2">Tài khoản cá nhân</p>
        <ul className="space-y-1">
          {accountItems.map(item => (
            <SidebarLink
              key={item.value}
              href={item.href}
              active={pathname === item.href}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </SidebarLink>
          ))}
        </ul>
      </div>

      <Separator className="my-4" />

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-3 px-2">Dịch vụ</p>
        <ul className="space-y-1">
          {serviceItems.map(item => (
            <SidebarLink
              key={item.value}
              href={item.href}
              active={pathname === item.href}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </SidebarLink>
          ))}
        </ul>
      </div>

      <Separator className="my-4" />

      {/* <div>
        <p className="text-xs font-semibold text-gray-500 mb-3 px-2">Thông báo</p>
        <ul className="space-y-1">
          {notificationItems.map(item => (
            <SidebarLink key={item.value} href={item.href} active={pathname === item.href}>
              {item.label}
            </SidebarLink>
          ))}
        </ul>
      </div> */}
    </nav>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="fixed top-3 left-4 z-50 lg:hidden"
              aria-label="Mở menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
            </div>
            <NavigationContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-full h-full border-r border-gray-200">
        <NavigationContent />
      </aside>
    </>
  );
}

function SidebarLink({
  href,
  active,
  children,
  onClick,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
          'min-h-[44px]', // Touch-friendly height
          active
            ? 'bg-green-50 text-green-600 border-r-2 border-green-600'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        )}
        aria-current={active ? 'page' : undefined}
      >
        <span className="truncate">{children}</span>
      </Link>
    </li>
  );
}
