export interface ServiceItem {
  id: number;
  name: string;
  unitPrice: number;
  warrantyPeriod: number;
  brand: string;
  description: string;
  isActive: boolean;
  model: string;
  stockQuantity: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItemSearchParams {
  sortBy: string;
  orderBy: string;
  name: string;
  limit: number;
  page: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  model?: string;
}

export interface ServiceItemResponse {
  serviceItems: ServiceItem[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

// Mock data for now - replace with actual API calls
export const fetchServiceItems = async (
  params: ServiceItemSearchParams
): Promise<ServiceItemResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock data
  const mockServiceItems: ServiceItem[] = [
    {
      id: 1,
      name: 'Máy hút bụi công nghiệp',
      unitPrice: 1500000,
      warrantyPeriod: 12,
      brand: 'Dyson',
      description: 'Máy hút bụi công nghiệp mạnh mẽ, phù hợp cho văn phòng và nhà xưởng',
      isActive: true,
      model: 'V15',
      stockQuantity: 10,
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Máy giặt thông minh',
      unitPrice: 8000000,
      warrantyPeriod: 24,
      brand: 'Samsung',
      description: 'Máy giặt thông minh với công nghệ AI, tiết kiệm nước và điện',
      isActive: true,
      model: 'WW90T',
      stockQuantity: 5,
      images: ['https://example.com/image3.jpg'],
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 3,
      name: 'Máy lọc không khí',
      unitPrice: 2500000,
      warrantyPeriod: 18,
      brand: 'Philips',
      description: 'Máy lọc không khí với công nghệ HEPA, loại bỏ 99.9% bụi mịn',
      isActive: false,
      model: 'AC2887',
      stockQuantity: 0,
      images: ['https://example.com/image4.jpg'],
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    },
  ];

  // Filter by name
  let filteredItems = mockServiceItems;
  if (params.name) {
    filteredItems = filteredItems.filter(item =>
      item.name.toLowerCase().includes(params.name.toLowerCase())
    );
  }

  // Filter by price range
  if (params.minPrice) {
    filteredItems = filteredItems.filter(item => item.unitPrice >= params.minPrice!);
  }
  if (params.maxPrice) {
    filteredItems = filteredItems.filter(item => item.unitPrice <= params.maxPrice!);
  }

  // Filter by brand
  if (params.brand) {
    filteredItems = filteredItems.filter(item =>
      item.brand.toLowerCase().includes(params.brand!.toLowerCase())
    );
  }

  // Filter by model
  if (params.model) {
    filteredItems = filteredItems.filter(item =>
      item.model.toLowerCase().includes(params.model!.toLowerCase())
    );
  }

  // Sort
  filteredItems.sort((a, b) => {
    const aValue = a[params.sortBy as keyof ServiceItem];
    const bValue = b[params.sortBy as keyof ServiceItem];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return params.orderBy === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return params.orderBy === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  // Pagination
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return {
    serviceItems: paginatedItems,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(filteredItems.length / params.limit),
    totalItems: filteredItems.length,
  };
};
