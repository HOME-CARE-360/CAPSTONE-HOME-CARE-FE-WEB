import { useState, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';

// Define interfaces for location data
interface Province {
  code: number;
  name: string;
  districts?: District[];
}

interface District {
  code: number;
  name: string;
  wards?: Ward[];
}

interface Ward {
  code: number;
  name: string;
}

// Define the filter types with proper typing
interface FilterValues {
  city?: string;
  district?: string;
  ward?: string;
  propertyType?: string;
  transactionType?: string;
  priceRange?: string;
  propertySize?: string;
  buildYear?: string;
  searchTerm?: string;
  category?: string;
  [key: string]: string | undefined;
}

// Property type mapping to API enum values
// const propertyTypeMap: Record<string, PropertyType> = {
//   'apartment': PropertyType.APARTMENT,
//   'land_plot': PropertyType.LAND_PLOT,
//   'villa': PropertyType.VILLA,
//   'shop_house': PropertyType.SHOP_HOUSE,
// };

// Add these constants at the top of the file
// const CENTRAL_CITIES = [
//   {
//     code: '1',
//     name: 'Hà Nội',
//     image:
//       'https://www.atlys.com/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FW3Iz4WACAy2J0qT0cCT3xA%2Fdidi%2Farticles%2Frlopvfixv5sap0yupj9osxaa%2Fpublic&w=1920&q=75',
//     icon: '🏛️',
//   },
//   {
//     code: '79',
//     name: 'TP. Hồ Chí Minh',
//     image:
//       'https://media.vneconomy.vn/images/upload/2024/05/20/tphcm-16726501373541473396704-16994302498261147920222.jpg',
//     icon: '🌆',
//   },
//   {
//     code: '48',
//     name: 'Đà Nẵng',
//     image:
//       'https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA',
//     icon: '🏖️',
//   },
//   {
//     code: '92',
//     name: 'Cần Thơ',
//     image: 'https://ik.imagekit.io/tvlk/blog/2021/11/dia-diem-du-lich-can-tho-cover.jpg',
//     icon: '🌾',
//   },
//   {
//     code: '31',
//     name: 'Hải Phòng',
//     image: 'https://heza.gov.vn/wp-content/uploads/2023/09/hai_phong-scaled.jpg',
//     icon: '⚓',
//   },
// ];

export default function SearchFilter() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [activeFilters, setActiveFilters] = useState<FilterValues>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Location states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');

  // Service categories - moved inside component
  const serviceCategories = [
    { value: 'cleaning', label: t('services.search_filter.categories_list.cleaning') },
    { value: 'massage', label: t('services.search_filter.categories_list.massage') },
    { value: 'cooking', label: t('services.search_filter.categories_list.cooking') },
    { value: 'nursing', label: t('services.search_filter.categories_list.nursing') },
  ];

  // Price range mapping - moved inside component
  const priceRangeMap: Record<string, string> = {
    '100k-300k': t('services.search_filter.price_ranges.100k-300k'),
    '300k-500k': t('services.search_filter.price_ranges.300k-500k'),
    '500k-750k': t('services.search_filter.price_ranges.500k-750k'),
    '750k-1m': t('services.search_filter.price_ranges.750k-1m'),
    '1m-plus': t('services.search_filter.price_ranges.1m-plus'),
  };

  // Initialize filters from URL search params
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const initialFilters: FilterValues = {};

    // Extract filters from URL
    if (params.has('city')) initialFilters.city = params.get('city') || undefined;
    if (params.has('district')) initialFilters.district = params.get('district') || undefined;
    if (params.has('ward')) initialFilters.ward = params.get('ward') || undefined;
    if (params.has('propertyType'))
      initialFilters.propertyType = params.get('propertyType') || undefined;
    if (params.has('priceRange')) initialFilters.priceRange = params.get('priceRange') || undefined;
    if (params.has('propertySize'))
      initialFilters.propertySize = params.get('propertySize') || undefined;
    if (params.has('buildYear')) initialFilters.buildYear = params.get('buildYear') || undefined;
    if (params.has('transactionType')) {
      const transactionType = params.get('transactionType');
      if (transactionType === 'FOR_SALE' || transactionType === 'FOR_RENT') {
        initialFilters.transactionType = transactionType;
      }
    }
    if (params.has('searchTerm')) initialFilters.searchTerm = params.get('searchTerm') || undefined;
    if (params.has('category')) initialFilters.category = params.get('category') || undefined;

    // Set initial search query if present
    if (params.has('searchTerm')) {
      setSearchQuery(params.get('searchTerm') || '');
    }

    setActiveFilters(initialFilters);
  }, [searchParams]);

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/');
        if (!response.ok) throw new Error('Failed to fetch provinces');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`
        );
        if (!response.ok) throw new Error('Failed to fetch districts');
        const data = await response.json();
        setDistricts(data.districts || []);
      } catch (error) {
        console.error('Error fetching districts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDistricts();
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      return;
    }

    const fetchWards = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`
        );
        if (!response.ok) throw new Error('Failed to fetch wards');
        const data = await response.json();
        setWards(data.wards || []);
      } catch (error) {
        console.error('Error fetching wards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWards();
  }, [selectedDistrict]);

  const handleFilterChange = (category: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleLocationChange = (type: 'province' | 'district' | 'ward', value: string) => {
    if (type === 'province') {
      const province = provinces.find(p => p.code.toString() === value);
      setSelectedProvince(value);
      setSelectedDistrict('');
      setSelectedWard('');
      handleFilterChange('city', province?.name || '');
      handleFilterChange('district', '');
      handleFilterChange('ward', '');
    } else if (type === 'district') {
      const district = districts.find(d => d.code.toString() === value);
      setSelectedDistrict(value);
      setSelectedWard('');
      handleFilterChange('district', district?.name || '');
      handleFilterChange('ward', '');
    } else {
      const ward = wards.find(w => w.code.toString() === value);
      setSelectedWard(value);
      handleFilterChange('ward', ward?.name || '');
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedWard('');
  };

  const countActiveFilters = () => {
    return Object.keys(activeFilters).filter(key => activeFilters[key]).length;
  };

  const handleSearch = () => {
    setIsSearching(true);

    // Build the URL query string from the filters
    const queryParams = new URLSearchParams();

    if (searchQuery) queryParams.set('searchTerm', searchQuery);

    // Add active filters to URL
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        // Special handling for transaction type to ensure it's properly encoded
        if (key === 'transactionType') {
          queryParams.set(key, value as string);
        } else {
          queryParams.set(key, value);
        }
      }
    });

    // Navigate to the same page with filters in URL
    router.push(`/services?${queryParams.toString()}`);

    // Reset searching state after a short delay to show loading state
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  // Mobile filters sheet component
  const MobileFilters = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 lg:hidden h-12 border-muted/50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>{t('services.search_filter.filters')}</span>
          {countActiveFilters() > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
            >
              {countActiveFilters()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{t('services.search_filter.mobile_filters')}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              {t('services.search_filter.reset')}
            </Button>
            {loading && (
              <div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin mr-2"></div>
            )}
            <SheetClose asChild>
              <Button size="sm" onClick={handleSearch}>
                {t('services.search_filter.done')}
              </Button>
            </SheetClose>
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto h-[calc(85vh-120px)] pb-20">
          <div className="space-y-4">
            <h4 className="font-medium">{t('services.search_filter.categories')}</h4>
            <Select
              value={activeFilters.category}
              onValueChange={value => handleFilterChange('category', value)}
            >
              <SelectTrigger className="h-12 border-muted/50">
                <SelectValue placeholder={t('services.search_filter.select_category')} />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">{t('services.search_filter.price_range')}</h4>
            <Select
              value={activeFilters.priceRange}
              onValueChange={value => handleFilterChange('priceRange', value)}
            >
              <SelectTrigger className="h-12 border-muted/50">
                <SelectValue placeholder={t('services.search_filter.select_price')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(priceRangeMap).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDistrict && (
            <Select
              value={selectedWard}
              onValueChange={value => handleLocationChange('ward', value)}
            >
              <SelectTrigger className="h-12 border-muted/50">
                <SelectValue placeholder={t('services.search_filter.location.select_ward')} />
              </SelectTrigger>
              <SelectContent>
                {wards.map(ward => (
                  <SelectItem key={ward.code} value={ward.code.toString()}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <section className="w-full max-w-screen px-4 md:px-8 xl:px-20 mx-auto py-8 md:py-16 bg-background text-foreground font-sans">
      <div className="mx-auto max-w-7xl">
        <Card className="w-full shadow-xl border-0 bg-card overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6 space-y-6">
              <div className="relative flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="relative w-full lg:flex-1">
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={t('services.search_filter.search_placeholder')}
                    className="pr-12 h-12 border-muted/50 focus:border-primary text-base"
                  />
                  {searchQuery && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-0 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="hidden lg:flex gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-12 border-muted/50 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-600 hover:border-red-200"
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>{t('services.search_filter.filters')}</span>
                    {countActiveFilters() > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
                      >
                        {countActiveFilters()}
                      </Badge>
                    )}
                  </Button>

                  <Button
                    className="h-12 bg-red-600 hover:bg-red-700"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin mr-2"></div>
                        {t('services.search_filter.searching')}
                      </div>
                    ) : (
                      t('services.search_filter.search_button')
                    )}
                  </Button>
                </div>

                <div className="flex w-full lg:hidden gap-2">
                  <MobileFilters />
                  <Button
                    className="flex-1 h-12 bg-red-600 hover:bg-red-700"
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin mr-2"></div>
                        {t('services.search_filter.searching')}
                      </div>
                    ) : (
                      t('services.search_filter.search_button')
                    )}
                  </Button>
                </div>
              </div>

              {countActiveFilters() > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-muted-foreground mr-2">
                    {t('services.search_filter.active_filters')}:
                  </span>
                  {Object.entries(activeFilters).map(([key, value]) => {
                    if (!value) return null;
                    let displayValue = value;
                    if (key === 'category') {
                      const category = serviceCategories.find(c => c.value === value);
                      displayValue = category?.label || value;
                    } else if (key === 'priceRange') {
                      displayValue = t(`services.search_filter.price_ranges.${value}`) || value;
                    }
                    return (
                      <Badge
                        key={key}
                        variant="secondary"
                        className="py-1.5 flex items-center gap-1 text-sm"
                      >
                        {displayValue}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 p-0 ml-1 hover:bg-transparent"
                          onClick={() => handleFilterChange(key, '')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {isFilterExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-6 pt-6 border-t">
                  <Select
                    value={activeFilters.category}
                    onValueChange={value => handleFilterChange('category', value)}
                  >
                    <SelectTrigger className="h-12 border-muted/50">
                      <SelectValue placeholder={t('services.search_filter.select_category')} />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={activeFilters.priceRange}
                    onValueChange={value => handleFilterChange('priceRange', value)}
                  >
                    <SelectTrigger className="h-12 border-muted/50">
                      <SelectValue placeholder={t('services.search_filter.select_price')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priceRangeMap).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedDistrict && (
                    <Select
                      value={selectedWard}
                      onValueChange={value => handleLocationChange('ward', value)}
                    >
                      <SelectTrigger className="h-12 border-muted/50">
                        <SelectValue
                          placeholder={t('services.search_filter.location.select_ward')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {wards.map(ward => (
                          <SelectItem key={ward.code} value={ward.code.toString()}>
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
