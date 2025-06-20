'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserCircleIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
// import { ThemeSwitch } from '@/components/ThemeSwitch';
import { Home } from 'lucide-react';
export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const { data: profileData } = useUserProfile();

  // Get user data from profile response
  const user = profileData?.profile
    ? {
        name: profileData.profile.fullName,
        email: profileData.profile.email,
        avatar: profileData.profile.avatar || '',
      }
    : {
        name: '',
        email: '',
        avatar: '',
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

  return (
    <header className="sticky z-1000 top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Home className="h-6 w-6 text-green-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                HomeCare
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/services"
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                Dịch vụ
              </Link>
              <Link
                href="/services"
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                Nhà cung cấp
              </Link>
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* <ThemeSwitch /> */}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full transition-all hover:bg-accent"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount sideOffset={8}>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="#" className="cursor-pointer">
                        <UserCircleIcon className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/profile" className="cursor-pointer">
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-3">
                <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Link href="/register/email">Đăng ký</Link>
                </Button>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
