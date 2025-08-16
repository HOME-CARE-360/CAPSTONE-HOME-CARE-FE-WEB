'use client';

import * as React from 'react';
import { UsersIcon, LayoutDashboardIcon, Drama, House } from 'lucide-react';
import { NavMain } from '@/components/common/navMain';
import { SiteSideFooter } from '@/app/(admin)/components/SiteSideFooter';
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
        title: 'Quản lý chung',
        url: '/admin/dashboard',
        icon: LayoutDashboardIcon,
      },
      {
        title: 'Quản lý quyền',
        url: '/admin/manage-permissions',
        icon: House,
      },
      // {
      //   title: 'Quản lý nhân viên',
      //   url: '/provider/manage-staff',
      //   icon: UsersIcon,
      // },
      {
        title: 'Quản lý người dùng',
        url: '/admin/manage-user',
        icon: UsersIcon,
      },
      {
        title: 'Quản lí vai trò',
        url: '/admin/manage-roles',
        icon: Drama,
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
        <SiteSideFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
