'use client';

import Link from 'next/link';
import Image from 'next/image';
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
import { UserCircleIcon, LogOutIcon } from 'lucide-react';
import { NavigationBar } from './NavigationBar';
import { getNameFallback } from '@/utils/helper';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const { data: profileData } = useUserProfile();

  // Get user data from profile response
  const user = profileData?.data
    ? {
        name: profileData.data.user.name,
        email: profileData.data.user.email,
        avatar: profileData.data.user.avatar || '',
      }
    : {
        name: '',
        email: '',
        avatar: '',
      };

  return (
    <header className="w-full bg-background text-foreground sticky top-0 z-50 border-b border-zinc-300 h-14 flex-shrink-0">
      <div className="container mx-auto px-4 h-full">
        <div className="flex h-full items-center justify-between">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link
                    href="/properties?transactionType=ForSale"
                    className="text-lg font-medium hover:text-red-500"
                  >
                    Bán
                  </Link>
                  <Link
                    href="/properties?transactionType=ForRent"
                    className="text-lg font-medium hover:text-red-500"
                  >
                    Cho thuê
                  </Link>
                  <Link
                    href="/properties?transactionType=ForSale"
                    className="text-lg font-medium hover:text-red-500"
                  >
                    Đất
                  </Link>
                  <Link href="#" className="text-lg font-medium hover:text-red-500">
                    Vay mua nhà
                  </Link>
                  <Link href="#" className="text-lg font-medium hover:text-red-500">
                    Tìm người bán
                  </Link>
                  <Link href="#" className="text-lg font-medium hover:text-red-500">
                    Bất động sản của tôi
                  </Link>
                </nav>
              </SheetContent>
            </Sheet> */}

            <Link href="/" className="flex items-center">
              {/* <Image
                src="/images/logo2.png"
                alt="HomeCare icon"
                width={50}
                height={50}
                priority
                className="rounded-md"
              /> */}
              <div className="lg:block hidden">
                <Image
                  src="/images/logo.png"
                  alt="HomeCare text"
                  width={150}
                  height={150}
                  priority
                  className="rounded-md"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Centered absolutely */}
          <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <NavigationBar />
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative size-10 rounded-full">
                    <Avatar className="size-10 ring-zinc-300 ring-2">
                      <AvatarImage
                        src={user.avatar || ''}
                        alt={user.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-red-500/10 text-red-500">
                        {getNameFallback(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/settings/profile" className="cursor-pointer">
                        <UserCircleIcon className="mr-2 h-4 w-4" />
                        Hồ sơ của tôi
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                {/* <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/register">Đăng ký</Link>
                </Button> */}
                <Button asChild variant="ghost" size="sm" className="">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Link href="/register">Đăng ký</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
