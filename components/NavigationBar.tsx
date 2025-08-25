'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Home,
  Building2,
  LandPlot,
  Key,
  Building,
  HomeIcon,
  CalendarIcon,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useServices } from '@/hooks/useService';
import { useCategories } from '@/hooks/useCategory';
import type { Category } from '@/lib/api/services/fetchCategory';
import type { Service } from '@/lib/api/services/fetchService';
import Image from 'next/image';

const serviceTypes = [
  {
    title: 'Dịch vụ',
    href: '/category',
    description: 'Tìm dịch vụ phù hợp với nhu cầu của bạn',
    icon: Home,
    color: 'text-blue-500',
  },
  {
    title: 'Dịch vụ sửa chữa',
    href: '/category/1',
    description: 'Tìm dịch vụ sửa chữa phù hợp với nhu cầu của bạn',
    icon: Building2,
    color: 'text-green-500',
  },
  {
    title: 'Dịch vụ dọn dẹp',
    href: '/category/2',
    description: 'Tìm dịch vụ vệ sinh phù hợp với nhu cầu của bạn',
    icon: Key,
    color: 'text-red-500',
  },
  {
    title: 'Dịch vụ khác',
    href: '/category  ',
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
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Fetch categories for search
  const { data: categoriesData } = useCategories();

  // Fetch services based on search query and category
  const { data: servicesData, isLoading: isLoadingServices } = useServices({
    name: searchQuery || undefined,
    categories: selectedCategory ? [selectedCategory] : undefined,
    limit: 10,
  });

  const categories = categoriesData?.categories || [];
  const services = servicesData?.services || [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory(null);
    // If query is long enough, trigger search automatically
    if (query.length >= 2) {
      // The useServices hook will automatically refetch with the new query
    }
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    // Navigate to service page with category filter
    const params = new URLSearchParams();
    params.append('category', categoryId.toString());
    router.push(`/service?${params.toString()}`);
    setSearchOpen(false);
  };

  const handleServiceSelect = (serviceId: number) => {
    router.push(`/service/${serviceId}`);
    setSearchOpen(false);
    setSearchQuery('');
    setSelectedCategory(null);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() || selectedCategory) {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCategory) params.append('category', selectedCategory.toString());
      router.push(`/service?${params.toString()}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSelectedCategory(null);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <NavigationMenu viewport={false}>
        <NavigationMenuList className="gap-1 font-mann">
          {/* Search Button */}
          <NavigationMenuItem>
            <Button
              variant="outline"
              className="gap-2 h-9 max-w-xs px-3"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Tìm kiếm dịch vụ...</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </NavigationMenuItem>

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

      {/* Search Dialog */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <Command className="rounded-lg border shadow-md w-[800px] max-w-[90vw]">
          <CommandInput
            placeholder="Tìm kiếm dịch vụ theo tên..."
            value={searchQuery}
            onValueChange={handleSearch}
            className="border-none focus:ring-0"
          />

          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm">
              {searchQuery ? 'Không tìm thấy dịch vụ nào.' : 'Bắt đầu nhập để tìm kiếm...'}
            </CommandEmpty>

            {/* Categories Section */}
            {!searchQuery && (
              <CommandGroup heading="Danh mục dịch vụ">
                {categories.map((category: Category) => (
                  <CommandItem
                    key={category.id}
                    onSelect={() => handleCategorySelect(category.id)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-accent"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {category.logo && (
                        <Image
                          width={20}
                          height={20}
                          src={category.logo}
                          alt={category.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Xem tất cả dịch vụ trong danh mục
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Quick Services Section - Show some services when no search */}
            {!searchQuery && services && services.length > 0 && (
              <CommandGroup heading="Dịch vụ nổi bật">
                {services.slice(0, 4).map((service: Service) => (
                  <CommandItem
                    key={service.id}
                    onSelect={() => handleServiceSelect(service.id)}
                    className="p-3 cursor-pointer hover:bg-accent/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {service.images && service.images.length > 0 && (
                        <Image
                          width={20}
                          height={20}
                          src={service.images[0]}
                          alt={service.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm line-clamp-2 mb-1">{service.name}</div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {service.Category?.name} • {service.durationMinutes} phút
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          {service.virtualPrice > 0
                            ? `${service.virtualPrice.toLocaleString('vi-VN')}đ`
                            : `${service.basePrice.toLocaleString('vi-VN')}đ`}
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Services Section */}
            {searchQuery && (
              <CommandGroup heading="Dịch vụ tìm thấy">
                {isLoadingServices ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm text-muted-foreground">Đang tìm kiếm...</span>
                  </div>
                ) : services && services.length > 0 ? (
                  services.map((service: Service) => (
                    <CommandItem
                      key={service.id}
                      onSelect={() => handleServiceSelect(service.id)}
                      className="p-3 cursor-pointer hover:bg-accent/50 rounded-lg transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {service.images && service.images.length > 0 && (
                          <Image
                            width={20}
                            height={20}
                            src={service.images[0]}
                            alt={service.name}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm line-clamp-2 mb-1">
                            {service.name}
                          </div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {service.Category?.name} • {service.durationMinutes} phút
                          </div>
                          <div className="text-sm font-semibold text-primary">
                            {service.virtualPrice > 0
                              ? `${service.virtualPrice.toLocaleString('vi-VN')}đ`
                              : `${service.basePrice.toLocaleString('vi-VN')}đ`}
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Không tìm thấy dịch vụ nào phù hợp với {searchQuery}
                  </div>
                ) : null}
              </CommandGroup>
            )}

            {/* Search Results Summary */}
            {searchQuery && (
              <CommandGroup heading="Hành động">
                <CommandItem
                  onSelect={handleSearchSubmit}
                  className="flex items-center gap-2 cursor-pointer bg-primary text-primary-foreground"
                >
                  <Search className="h-4 w-4" />
                  <span>Tìm kiếm {searchQuery}</span>
                  {selectedCategory && (
                    <span>
                      trong danh mục{' '}
                      {categories.find((c: Category) => c.id === selectedCategory)?.name}
                    </span>
                  )}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
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
