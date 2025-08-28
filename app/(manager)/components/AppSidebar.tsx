'use client';

import * as React from 'react';
import { Building2, FileText, Layers, LayoutDashboardIcon, Banknote } from 'lucide-react';
import { NavMain } from '@/components/common/navMain';
import { SiteSideFooter } from '@/app/(manager)/components/SiteSideFooter';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
};

interface NavigationData {
  navMain: NavItem[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigationData: NavigationData = {
    navMain: [
      {
        title: 'Quản lý công ty',
        url: '/manager/manage-company',
        icon: Building2,
      },
      {
        title: 'Quản lý dịch vụ',
        url: '/manager/manage-service',
        icon: LayoutDashboardIcon,
      },
      {
        title: 'Quản lý loại dịch vụ',
        url: '/manager/manage-category',
        icon: Layers,
      },
      {
        title: 'Quản lý báo cáo',
        url: '/manager/manage-report',
        icon: FileText,
      },
      {
        title: 'Quản lý rút tiền',
        url: '/manager/manage-withdraw',
        icon: Banknote,
      },
    ],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b mb-2 border-gray-200 dark:border-gray-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Link href="/" className="flex items-center justify-center w-full">
                <Image
                  src="/images/logo.png"
                  alt="HomeCare 360"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <NavMain items={navigationData.navMain} />
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 dark:border-gray-700">
        <SiteSideFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
