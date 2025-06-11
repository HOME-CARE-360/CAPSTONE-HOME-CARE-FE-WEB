'use client';

import * as React from 'react';
import { BarChartIcon, House, LayoutDashboardIcon, ListIcon, UsersIcon } from 'lucide-react';
import { NavMain } from '@/components/common/navMain';
import { NavUser } from '@/components/common/navUser';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';
import { LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
};

interface NavigationData {
  navMain: NavItem[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  console.log('user', user);

  console.log(user);

  const navigationData: NavigationData = {
    navMain: [
      {
        title: 'Quản lý chung',
        url: '/provider/dashboard',
        icon: LayoutDashboardIcon,
      },
      {
        title: 'Quản lý dịch vụ',
        url: '/provider/manage-services',
        icon: House,
      },
      {
        title: 'Quản lý nhân viên',
        url: '/provider/manager-staff',
        icon: UsersIcon,
      },
      {
        title: t('appSidebar.lifecycle'),
        url: '/provider/lifecycle',
        icon: ListIcon,
      },
      {
        title: t('appSidebar.analytics'),
        url: '/provider/analytics',
        icon: BarChartIcon,
      },
    ],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <a href="/" className="flex items-center gap-2">
                <span className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  HomeCare 360
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <NavMain items={navigationData.navMain} />
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 dark:border-gray-700">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
