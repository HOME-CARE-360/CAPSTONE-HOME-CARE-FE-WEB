'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './language-selector';
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

export default function Header() {
  const { t } = useTranslation();
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
    <header className="w-full max-w-[1440px] md:px-8 xl:px-20 mx-auto bg-background text-foreground top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <nav className="hidden md:flex items-center gap-6 text-base font-normal text-foreground">
          <Link href="/services?">{t('header.services')}</Link>
          <Link href="/services?">{t('header.best_services')}</Link>
          <Link href="/services?">{t('header.best_agents')}</Link>
          {/* <Link href="#">{t('header.transfer')}</Link> */}
          {/* <Link href="#">{t('header.apartment')}</Link>
          <Link href="#">{t('header.services')}</Link> */}
        </nav>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://i.pinimg.com/736x/c4/f5/fa/c4f5fa60b185e0e5771de1f4c96d7372.jpg"
            alt="HomeCare"
            width={80}
            height={80}
            priority
            className="rounded-md"
          />
          <div className="relative w-36 h-10">
            <Image
              src="https://i.pinimg.com/736x/c4/f5/fa/c4f5fa60b185e0e5771de1f4c96d7372.jpg"
              alt="HomeCare"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSelector />

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
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
                    <Link href="#">
                      <UserCircleIcon className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/register/email">{t('header.register')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login">{t('header.login')}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
