import { useState, useEffect } from 'react';
import {
  MapPin,
  DollarSign,
  Ruler,
  Building,
  //Calendar,
  SlidersHorizontal,
  X,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  // SelectGroup,
  SelectItem,
  // SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import { TransactionType } from '@/lib/api/services/fetchService';
import Image from 'next/image';

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
  transactionType?: TransactionType;
  priceRange?: string;
  propertySize?: string;
  buildYear?: string;
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
const CENTRAL_CITIES = [
  {
    code: '1',
    name: 'Hà Nội',
    image:
      'https://www.atlys.com/_next/image?url=https%3A%2F%2Fimagedelivery.net%2FW3Iz4WACAy2J0qT0cCT3xA%2Fdidi%2Farticles%2Frlopvfixv5sap0yupj9osxaa%2Fpublic&w=1920&q=75',
    icon: '🏛️',
  },
  {
    code: '79',
    name: 'TP. Hồ Chí Minh',
    image:
      'https://media.vneconomy.vn/images/upload/2024/05/20/tphcm-16726501373541473396704-16994302498261147920222.jpg',
    icon: '🌆',
  },
  {
    code: '48',
    name: 'Đà Nẵng',
    image:
      'https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA',
    icon: '🏖️',
  },
  {
    code: '92',
    name: 'Cần Thơ',
    image: 'https://ik.imagekit.io/tvlk/blog/2021/11/dia-diem-du-lich-can-tho-cover.jpg',
    icon: '🌾',
  },
  {
    code: '31',
    name: 'Hải Phòng',
    image: 'https://heza.gov.vn/wp-content/uploads/2023/09/hai_phong-scaled.jpg',
    icon: '⚓',
  },
];

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
  console.log(loading);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');

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
      if (
        transactionType === TransactionType.FOR_SALE ||
        transactionType === TransactionType.FOR_RENT
      ) {
        initialFilters.transactionType = transactionType;
      }
    }

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
            <SheetClose asChild>
              <Button size="sm" onClick={handleSearch}>
                {t('services.search_filter.done')}
              </Button>
            </SheetClose>
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto h-[calc(85vh-120px)] pb-20">
          <div className="space-y-4">
            <h4 className="font-medium">{t('services.search_filter.location')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <Select
                value={selectedProvince || selectedDistrict || selectedWard ? 'selected' : ''}
                onValueChange={() => {}}
              >
                <SelectTrigger className="h-12 border-muted/50">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder={t('services.search_filter.location')}>
                      {selectedProvince && (
                        <span className="flex items-center gap-2">
                          {provinces.find(p => p.code.toString() === selectedProvince)?.name}
                          {selectedDistrict && (
                            <>
                              <span className="text-muted-foreground">/</span>
                              {districts.find(d => d.code.toString() === selectedDistrict)?.name}
                              {selectedWard && (
                                <>
                                  <span className="text-muted-foreground">/</span>
                                  {wards.find(w => w.code.toString() === selectedWard)?.name}
                                </>
                              )}
                            </>
                          )}
                        </span>
                      )}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="p-4 w-[1200px]">
                  <div className="space-y-6">
                    {/* Location Selection Tabs */}
                    <div className="flex gap-2 border-b">
                      <button
                        onClick={() => {
                          setSelectedProvince('');
                          setSelectedDistrict('');
                          setSelectedWard('');
                        }}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          !selectedProvince
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Tỉnh/Thành phố
                      </button>
                      <button
                        onClick={() => {
                          if (selectedProvince) {
                            setSelectedDistrict('');
                            setSelectedWard('');
                          }
                        }}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          selectedProvince && !selectedDistrict
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        } ${!selectedProvince ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Quận/Huyện
                      </button>
                      <button
                        onClick={() => {
                          if (selectedDistrict) {
                            setSelectedWard('');
                          }
                        }}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                          selectedDistrict && !selectedWard
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        } ${!selectedDistrict ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        Phường/Xã
                      </button>
                    </div>

                    {/* Location Selection Content */}
                    <div className="space-y-6">
                      {/* Province Selection */}
                      {!selectedProvince && (
                        <div className="space-y-6">
                          {/* Central Cities Section */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground">
                              Thành phố trực thuộc trung ương
                            </h4>
                            <div className="grid grid-cols-5 gap-4">
                              {CENTRAL_CITIES.map(city => (
                                <button
                                  key={city.code}
                                  onClick={() => {
                                    handleLocationChange('province', city.code);
                                    setSelectedDistrict('');
                                    setSelectedWard('');
                                  }}
                                  className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                                    selectedProvince === city.code
                                      ? 'border-primary shadow-lg scale-105'
                                      : 'border-transparent hover:border-primary/50'
                                  }`}
                                >
                                  <div className="aspect-[4/3] relative">
                                    <Image
                                      src={city.image}
                                      alt={city.name}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl">{city.icon}</span>
                                        <span className="font-medium">{city.name}</span>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Other Cities Grid */}
                          <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground">
                              Tỉnh/Thành phố khác
                            </h4>
                            <div className="grid grid-cols-5 gap-2">
                              {provinces
                                .filter(
                                  province =>
                                    !CENTRAL_CITIES.find(
                                      city => city.code === province.code.toString()
                                    )
                                )
                                .map(province => (
                                  <button
                                    key={province.code}
                                    onClick={() => {
                                      handleLocationChange('province', province.code.toString());
                                      setSelectedDistrict('');
                                      setSelectedWard('');
                                    }}
                                    className={`w-full p-2 rounded-md hover:bg-muted flex items-center gap-2 ${
                                      selectedProvince === province.code.toString()
                                        ? 'bg-primary text-primary-foreground'
                                        : ''
                                    }`}
                                  >
                                    <span className="text-xl">🏘️</span>
                                    <span className="text-sm">{province.name}</span>
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* District Selection */}
                      {selectedProvince && !selectedDistrict && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground">Quận/Huyện</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {districts.map(district => (
                              <button
                                key={district.code}
                                onClick={() => {
                                  handleLocationChange('district', district.code.toString());
                                  setSelectedWard('');
                                }}
                                className={`w-full p-2 rounded-md hover:bg-muted flex items-center gap-2 ${
                                  selectedDistrict === district.code.toString()
                                    ? 'bg-primary text-primary-foreground'
                                    : ''
                                }`}
                              >
                                <span className="text-xl">🏢</span>
                                <span className="text-sm">{district.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ward Selection */}
                      {selectedDistrict && !selectedWard && (
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground">Phường/Xã</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {wards.map(ward => (
                              <button
                                key={ward.code}
                                onClick={() => handleLocationChange('ward', ward.code.toString())}
                                className={`w-full p-2 rounded-md hover:bg-muted flex items-center gap-2 ${
                                  selectedWard === ward.code.toString()
                                    ? 'bg-primary text-primary-foreground'
                                    : ''
                                }`}
                              >
                                <span className="text-xl">🏠</span>
                                <span className="text-sm">{ward.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">{t('services.search_filter.property_type')}</h4>
            <Select
              value={activeFilters.propertyType}
              onValueChange={value => handleFilterChange('propertyType', value)}
            >
              <SelectTrigger className="h-12 border-muted/50">
                <div className="flex items-center">
                  <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder={t('services.search_filter.property_type')} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apartment">Căn hộ</SelectItem>
                <SelectItem value="villa">Biệt thự</SelectItem>
                <SelectItem value="land_plot">Đất</SelectItem>
                <SelectItem value="shop_house">Nhà phố</SelectItem>
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
                <div className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder={t('services.search_filter.price_range')} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100k-300k">100 - 300 VND</SelectItem>
                <SelectItem value="300k-500k">300 - 500 VND</SelectItem>
                <SelectItem value="500k-750k">500 - 750 VND</SelectItem>
                <SelectItem value="750k-1m">750 - 1M VND</SelectItem>
                <SelectItem value="1m-plus">1M+ VND</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">{t('services.search_filter.property_size')}</h4>
            <Select
              value={activeFilters.propertySize}
              onValueChange={value => handleFilterChange('propertySize', value)}
            >
              <SelectTrigger className="h-12 border-muted/50">
                <div className="flex items-center">
                  <Ruler className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder={t('services.search_filter.property_size')} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500-1000">500 - 1,000 m2</SelectItem>
                <SelectItem value="1000-1500">1,000 - 1,500 m2</SelectItem>
                <SelectItem value="1500-2000">1,500 - 2,000 m2</SelectItem>
                <SelectItem value="2000-3000">2,000 - 3,000 m2</SelectItem>
                <SelectItem value="3000-plus">3,000+ m2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Loại</h4>
            <Select
              value={activeFilters.transactionType}
              onValueChange={value => handleFilterChange('transactionType', value)}
            >
              <SelectTrigger className="h-12 border-muted/50">
                <div className="flex items-center">
                  <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Loại" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TransactionType.FOR_SALE}>Bán</SelectItem>
                <SelectItem value={TransactionType.FOR_RENT}>Cho thuê</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  {activeFilters.city && (
                    <Badge variant="secondary" className="py-1.5 flex items-center gap-1 text-sm">
                      {activeFilters.city}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-0 ml-1 hover:bg-transparent"
                        onClick={() => {
                          handleFilterChange('city', '');
                          setSelectedProvince('');
                          setSelectedDistrict('');
                          setSelectedWard('');
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {activeFilters.district && (
                    <Badge variant="secondary" className="py-1.5 flex items-center gap-1 text-sm">
                      {activeFilters.district}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-0 ml-1 hover:bg-transparent"
                        onClick={() => {
                          handleFilterChange('district', '');
                          setSelectedDistrict('');
                          setSelectedWard('');
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {activeFilters.ward && (
                    <Badge variant="secondary" className="py-1.5 flex items-center gap-1 text-sm">
                      {activeFilters.ward}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-0 ml-1 hover:bg-transparent"
                        onClick={() => {
                          handleFilterChange('ward', '');
                          setSelectedWard('');
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {activeFilters.transactionType && (
                    <Badge variant="secondary" className="py-1.5 flex items-center gap-1 text-sm">
                      {activeFilters.transactionType === TransactionType.FOR_SALE
                        ? 'Bán'
                        : 'Cho thuê'}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-0 ml-1 hover:bg-transparent"
                        onClick={() => handleFilterChange('transactionType', '')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {Object.entries(activeFilters).map(
                    ([key, value]) =>
                      value &&
                      !['city', 'district', 'ward', 'transactionType'].includes(key) && (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="py-1.5 flex items-center gap-1 text-sm"
                        >
                          {String(value).replace(/-/g, ' ')}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 p-0 ml-1 hover:bg-transparent"
                            onClick={() => handleFilterChange(key, '')}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )
                  )}
                </div>
              )}

              {isFilterExpanded && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-6 pt-6 border-t">
                  <Select
                    value={selectedProvince || selectedDistrict || selectedWard ? 'selected' : ''}
                    onValueChange={() => {}}
                  >
                    <SelectTrigger className="h-12 border-muted/50">
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder={t('services.search_filter.location')}>
                          {selectedProvince && (
                            <span className="flex items-center gap-2">
                              {provinces.find(p => p.code.toString() === selectedProvince)?.name}
                              {/* {selectedDistrict && (
                                <>
                                  <span className="text-muted-foreground">/</span>
                                  {districts.find(d => d.code.toString() === selectedDistrict)?.name}
                                  {selectedWard && (
                                    <>
                                      <span className="text-muted-foreground">/</span>
                                      {wards.find(w => w.code.toString() === selectedWard)?.name}
                                    </>
                                  )}
                                </>
                              )} */}
                            </span>
                          )}
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="p-4 w-[1200px]">
                      <div className="space-y-6">
                        {/* Location Selection Tabs */}
                        <div className="flex gap-2 border-b">
                          <button
                            onClick={() => {
                              setSelectedProvince('');
                              setSelectedDistrict('');
                              setSelectedWard('');
                            }}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                              !selectedProvince
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Tỉnh/Thành phố
                          </button>
                          <button
                            onClick={() => {
                              if (selectedProvince) {
                                setSelectedDistrict('');
                                setSelectedWard('');
                              }
                            }}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                              selectedProvince && !selectedDistrict
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            } ${!selectedProvince ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Quận/Huyện
                          </button>
                          <button
                            onClick={() => {
                              if (selectedDistrict) {
                                setSelectedWard('');
                              }
                            }}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                              selectedDistrict && !selectedWard
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            } ${!selectedDistrict ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Phường/Xã
                          </button>
                        </div>

                        {/* Location Selection Content */}
                        <div className="space-y-6">
                          {/* Province Selection */}
                          {!selectedProvince && (
                            <div className="space-y-6">
                              {/* Central Cities Section */}
                              <div className="space-y-4">
                                <h4 className="font-medium text-sm text-muted-foreground">
                                  Thành phố trực thuộc trung ương
                                </h4>
                                <div className="grid grid-cols-5 gap-4">
                                  {CENTRAL_CITIES.map(city => (
                                    <button
                                      key={city.code}
                                      onClick={() => {
                                        handleLocationChange('province', city.code);
                                        setSelectedDistrict('');
                                        setSelectedWard('');
                                      }}
                                      className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                                        selectedProvince === city.code
                                          ? 'border-primary shadow-lg scale-105'
                                          : 'border-transparent hover:border-primary/50'
                                      }`}
                                    >
                                      <div className="aspect-[4/3] relative">
                                        <Image
                                          src={city.image}
                                          alt={city.name}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xl">{city.icon}</span>
                                            <span className="font-medium">{city.name}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Other Cities Grid */}
                              <div className="space-y-4">
                                <h4 className="font-medium text-sm text-muted-foreground">
                                  Tỉnh/Thành phố khác
                                </h4>
                                <div className="grid grid-cols-5 gap-2">
                                  {provinces
                                    .filter(
                                      province =>
                                        !CENTRAL_CITIES.find(
                                          city => city.code === province.code.toString()
                                        )
                                    )
                                    .map(province => (
                                      <button
                                        key={province.code}
                                        onClick={() => {
                                          handleLocationChange(
                                            'province',
                                            province.code.toString()
                                          );
                                          setSelectedDistrict('');
                                          setSelectedWard('');
                                        }}
                                        className={`w-full p-2 rounded-md hover:bg-muted flex items-center gap-2 ${
                                          selectedProvince === province.code.toString()
                                            ? 'bg-primary text-primary-foreground'
                                            : ''
                                        }`}
                                      >
                                        <span className="text-xl">🏘️</span>
                                        <span className="text-sm">{province.name}</span>
                                      </button>
                                    ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* District Selection */}
                          {selectedProvince && !selectedDistrict && (
                            <div className="space-y-4">
                              <h4 className="font-medium text-sm text-muted-foreground">
                                Quận/Huyện
                              </h4>
                              <div className="grid grid-cols-5 gap-2">
                                {districts.map(district => (
                                  <button
                                    key={district.code}
                                    onClick={() => {
                                      handleLocationChange('district', district.code.toString());
                                      setSelectedWard('');
                                    }}
                                    className={`w-full p-2 rounded-md hover:bg-muted flex items-center gap-2 ${
                                      selectedDistrict === district.code.toString()
                                        ? 'bg-primary text-primary-foreground'
                                        : ''
                                    }`}
                                  >
                                    <span className="text-xl">🏢</span>
                                    <span className="text-sm">{district.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Ward Selection */}
                          {selectedDistrict && !selectedWard && (
                            <div className="space-y-4">
                              <h4 className="font-medium text-sm text-muted-foreground">
                                Phường/Xã
                              </h4>
                              <div className="grid grid-cols-5 gap-2">
                                {wards.map(ward => (
                                  <button
                                    key={ward.code}
                                    onClick={() =>
                                      handleLocationChange('ward', ward.code.toString())
                                    }
                                    className={`w-full p-2 rounded-md hover:bg-muted flex items-center gap-2 ${
                                      selectedWard === ward.code.toString()
                                        ? 'bg-primary text-primary-foreground'
                                        : ''
                                    }`}
                                  >
                                    <span className="text-xl">🏠</span>
                                    <span className="text-sm">{ward.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectContent>
                  </Select>

                  <Select
                    value={activeFilters.propertyType}
                    onValueChange={value => handleFilterChange('propertyType', value)}
                  >
                    <SelectTrigger className="h-12 border-muted/50">
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder={t('services.search_filter.property_type')} />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Căn hộ</SelectItem>
                      <SelectItem value="villa">Biệt thự</SelectItem>
                      <SelectItem value="land_plot">Đất</SelectItem>
                      <SelectItem value="shop_house">Nhà phố</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={activeFilters.priceRange}
                    onValueChange={value => handleFilterChange('priceRange', value)}
                  >
                    <SelectTrigger className="h-12 border-muted/50">
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder={t('services.search_filter.price_range')} />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100k-300k">100 - 300 VND</SelectItem>
                      <SelectItem value="300k-500k">300 - 500 VND</SelectItem>
                      <SelectItem value="500k-750k">500 - 750 VND</SelectItem>
                      <SelectItem value="750k-1m">750 - 1M VND</SelectItem>
                      <SelectItem value="1m-plus">1M+ VND</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={activeFilters.propertySize}
                    onValueChange={value => handleFilterChange('propertySize', value)}
                  >
                    <SelectTrigger className="h-12 border-muted/50">
                      <div className="flex items-center">
                        <Ruler className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder={t('services.search_filter.property_size')} />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="500-1000">500 - 1,000 m2</SelectItem>
                      <SelectItem value="1000-1500">1,000 - 1,500 m2</SelectItem>
                      <SelectItem value="1500-2000">1,500 - 2,000 m2</SelectItem>
                      <SelectItem value="2000-3000">2,000 - 3,000 m2</SelectItem>
                      <SelectItem value="3000-plus">3,000+ m2</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={activeFilters.transactionType}
                    onValueChange={value => handleFilterChange('transactionType', value)}
                  >
                    <SelectTrigger className="h-12 border-muted/50">
                      <div className="flex items-center">
                        <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Loại" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TransactionType.FOR_SALE}>Bán</SelectItem>
                      <SelectItem value={TransactionType.FOR_RENT}>Cho thuê</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
