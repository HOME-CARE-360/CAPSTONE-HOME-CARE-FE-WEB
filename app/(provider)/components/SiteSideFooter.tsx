'use client';

import {
  BellIcon,
  CheckCircle2Icon,
  ClockIcon,
  LogOutIcon,
  MoonIcon,
  MoreVerticalIcon,
  UserCircleIcon,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUser';
import { useAuth } from '@/hooks/useAuth';

export function SiteSideFooter() {
  const { isMobile } = useSidebar();
  const { data: profileData, isLoading: profileLoading } = useUserProfile();
  const { logout } = useAuth();
  const [status, setStatus] = useState<string>('Online');
  // Define user status options inside the component
  const userStatusOptions = [
    {
      value: 'Online',
      label: 'Trực tuyến',
      icon: CheckCircle2Icon,
      color: 'text-green-500',
    },
    {
      value: 'Idle',
      label: 'Hoạt động',
      icon: ClockIcon,
      color: 'text-orange-500',
    },
    {
      value: 'DoNotDisturb',
      label: 'Ngủ',
      icon: MoonIcon,
      color: 'text-red-500',
    },
    {
      value: 'Invisible',
      label: 'Tắt hoạt động',
      icon: UserCircleIcon,
      color: 'text-gray-500',
    },
  ];
  // Get user data from profile response
  const user = profileData?.profile
    ? {
        name: profileData.profile.fullName,
        email: profileData.profile.email,
        avatar: profileData.profile.avatar || '',
        status: profileData.profile.status,
      }
    : {
        name: 'FPT Student Code',
        email: 'exampletest@gmail.com',
        avatar: 'https://placehold.co/400',
        status: 'Online',
      };

  // Update status state when profile data loads
  useEffect(() => {
    if (profileData?.profile?.status) {
      setStatus(profileData.profile.status);
    }
  }, [profileData]);

  // Update user status
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);

    // Create FormData for the status update
    const formData = new FormData();
    formData.append('status', newStatus);

    // Get current user data to include in the form
    if (profileData?.profile) {
      formData.append('userName', profileData.profile.userName);
      formData.append('fullName', profileData.profile.fullName);
      formData.append('email', profileData.profile.email);

      if (profileData.profile.phoneNumber) {
        formData.append('phoneNumber', profileData.profile.phoneNumber);
      }

      if (profileData.profile.about) {
        formData.append('about', profileData.profile.about);
      }

      if (profileData.profile.birthDate) {
        formData.append('birthDate', profileData.profile.birthDate);
      }

      formData.append('role', profileData.profile.role);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    // Router redirect will happen automatically through the logout hook
  };

  // Create initials from name for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const initials = getInitials(user.name);

  // Get status option based on current status
  const currentStatusOption =
    userStatusOptions.find(option => option.value === status) || userStatusOptions[0];
  const StatusIcon = currentStatusOption.icon;

  // Loading skeleton - full component version
  if (profileLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          {/* Skeleton for the main menu button */}
          <SidebarMenuButton size="lg">
            <div className="relative">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
                <Skeleton className="h-3 w-3 rounded-full" />
              </div>
            </div>
            <div className="grid flex-1 gap-1 text-left">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="ml-auto h-4 w-4" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="relative">
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
                  <StatusIcon className={`size-3 ${currentStatusOption.color}`} />
                </div>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="relative">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
                    <StatusIcon className={`size-3 ${currentStatusOption.color}`} />
                  </div>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Status selection */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <div className="flex items-center">
                  <StatusIcon className={`mr-2 h-4 w-4 ${currentStatusOption.color}`} />
                  <span>Trạng thái hoạt động</span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={status} onValueChange={handleStatusChange}>
                  {userStatusOptions.map(option => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <option.icon className={`mr-2 h-4 w-4 ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href={
                    profileData?.profile?.role === 'Admin' ? '/admin/profile' : '/saler/profile'
                  }
                >
                  <UserCircleIcon className="mr-2 h-4 w-4" />
                  Tài khoản
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon className="mr-2 h-4 w-4" />
                Thông báo
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="hover:bg-red">
              <LogOutIcon className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
