'use client';

import * as React from 'react';
import Link from 'next/link';
import { Home, Building2, LandPlot, Key, Building, HomeIcon, CalendarIcon } from 'lucide-react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const serviceTypes = [
  {
    title: 'Dịch vụ',
    href: '/services',
    description: 'Tìm dịch vụ phù hợp với nhu cầu của bạn',
    icon: Home,
    color: 'text-blue-500',
  },
  {
    title: 'Dịch vụ sửa chữa',
    href: '/services?serviceType=Repair',
    description: 'Tìm dịch vụ sửa chữa phù hợp với nhu cầu của bạn',
    icon: Building2,
    color: 'text-green-500',
  },
  {
    title: 'Dịch vụ vệ sinh',
    href: '/services?serviceType=Cleaning',
    description: 'Tìm dịch vụ vệ sinh phù hợp với nhu cầu của bạn',
    icon: Key,
    color: 'text-red-500',
  },
  {
    title: 'Dịch vụ khác',
    href: '/services?serviceType=Other',
    description: 'Tìm dịch vụ khác phù hợp với nhu cầu của bạn',
    icon: LandPlot,
    color: 'text-amber-500',
  },
];
const myServices = [
  {
    title: 'Dịch vụ yêu thích của tôi',
    href: '/settings/favorites',
    description: 'Xem dịch vụ yêu thích của tôi',
    icon: HomeIcon,
    color: 'text-red-500',
  },
  {
    title: 'Booking của tôi',
    href: '/settings/bookings',
    description: 'Xem booking của tôi',
    icon: CalendarIcon,
    color: 'text-blue-500',
  },
];

export function NavigationBar() {
  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList className="gap-1 font-mann">
        <NavigationMenuItem>
          <NavigationMenuTrigger className="gap-2">
            <Building className="h-4 w-4" />
            Dịch vụ
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {serviceTypes.map(item => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                  color={item.color}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="gap-2">
            <HomeIcon className="h-4 w-4" />
            Dịch vụ của tôi
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-2 md:w-[500px] md:grid-cols-2">
              {myServices.map(item => (
                <ListItem
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={item.icon}
                  color={item.color}
                >
                  {item.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

interface ListItemProps extends React.ComponentPropsWithoutRef<'li'> {
  href: string;
  title: string;
  icon?: React.ElementType;
  color?: string;
}

function ListItem({ title, children, href, icon: Icon, color, ...props }: ListItemProps) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className={cn('h-4 w-4 transition-colors group-hover:scale-110', color)} />
            )}
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-2">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
