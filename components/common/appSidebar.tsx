'use client';

import * as React from 'react';
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HandCoins,
  HelpCircleIcon,
  House,
  LayoutDashboardIcon,
  ListIcon,
  ListTodo,
  SearchIcon,
  SettingsIcon,
  Users,
  UsersIcon,
} from 'lucide-react';
import { NavDocuments } from '@/components/common/navDocuments';
import { NavMain } from '@/components/common/navMain';
import { NavSecondary } from '@/components/common/navSecondary';
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const navigationData = {
    navMain: [
      {
        title: t('appSidebar.dashboard'),
        url: '/provider/dashboard',
        icon: LayoutDashboardIcon,
      },
      {
        title: t('appSidebar.property'),
        url: '/provider/property',
        icon: House,
      },
      {
        title: t('appSidebar.rentalContracts'),
        url: '/provider/contract',
        icon: FileTextIcon,
      },
      {
        title: t('appSidebar.owner'),
        url: '/provider/owner',
        icon: Users,
      },
      {
        title: t('appSidebar.salesPipeline'),
        url: '/provider/sales',
        icon: HandCoins,
      },
      {
        title: t('Lead'),
        url: '/provider/lead',
        icon: Users,
      },
      {
        title: t('appSidebar.tasks'),
        url: '/provider/tasks',
        icon: ListTodo,
      },
      {
        title: t('appSidebar.lifecycle'),
        url: '#',
        icon: ListIcon,
      },
      {
        title: t('appSidebar.analytics'),
        url: '#',
        icon: BarChartIcon,
      },
      {
        title: t('appSidebar.projects'),
        url: '#',
        icon: FolderIcon,
      },
      {
        title: t('appSidebar.team'),
        url: '#',
        icon: UsersIcon,
      },
    ],
    navClouds: [
      {
        title: t('appSidebar.capture'),
        icon: CameraIcon,
        isActive: true,
        url: '#',
        items: [
          {
            title: t('appSidebar.activeProposals'),
            url: '#',
          },
          {
            title: t('appSidebar.archived'),
            url: '#',
          },
        ],
      },
      {
        title: t('appSidebar.proposal'),
        icon: FileTextIcon,
        url: '#',
        items: [
          {
            title: t('appSidebar.activeProposals'),
            url: '#',
          },
          {
            title: t('appSidebar.archived'),
            url: '#',
          },
        ],
      },
      {
        title: t('appSidebar.prompts'),
        icon: FileCodeIcon,
        url: '#',
        items: [
          {
            title: t('appSidebar.activeProposals'),
            url: '#',
          },
          {
            title: t('appSidebar.archived'),
            url: '#',
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: t('appSidebar.settings'),
        url: '#',
        icon: SettingsIcon,
      },
      {
        title: t('appSidebar.getHelp'),
        url: '#',
        icon: HelpCircleIcon,
      },
      {
        title: t('appSidebar.search'),
        url: '#',
        icon: SearchIcon,
      },
    ],
    documents: [
      {
        name: t('appSidebar.dataLibrary'),
        url: '#',
        icon: DatabaseIcon,
      },
      {
        name: t('appSidebar.reports'),
        url: '#',
        icon: ClipboardListIcon,
      },
      {
        name: t('appSidebar.wordAssistant'),
        url: '#',
        icon: FileIcon,
      },
    ],
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">HomeCare 360</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        <NavDocuments items={navigationData.documents} />
        <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
