import apiService, { RequestParams } from '../core';

export enum ServiceStatus {
  AVAILABLE = 'Available',
  PENDING = 'Pending',
  SOLD = 'Sold',
  RENTED = 'Rented',
}

export enum ServiceType {
  APARTMENT = 'Apartment',
  LAND_PLOT = 'LandPlot',
  VILLA = 'Villa',
  SHOP_HOUSE = 'ShopHouse',
}

export enum TransactionType {
  FOR_RENT = 'ForRent',
  FOR_SALE = 'ForSale',
}

export enum ServiceDetailFilters {
  hasBasement = 'hasBasement',
  furnished = 'furnished',
}

export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  nationality: string;
}

export interface Location {
  address: string;
  city: string;
  district: string;
  ward: string;
  latitude: number;
  longitude: number;
}

export enum ApartmentOrientation {
  NORTH = 'North',
  SOUTH = 'South',
  EAST = 'East',
  WEST = 'West',
  NORTHEAST = 'North East',
  NORTHWEST = 'North West',
  SOUTHEAST = 'South East',
  SOUTHWEST = 'South West',
}

export interface PropertyDetail {
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchens: number;
  landArea: number;
  landWidth: number;
  landLength: number;
  buildingArea: number;
  numberOfFloors: number;
  hasBasement: boolean;
  floorNumber: number;
  apartmentOrientation: ApartmentOrientation;
  furnished: boolean;
}

export enum Currency {
  VND = 'VND',
  USD = 'USD',
}

export enum PaymentMethod {
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer',
  CREDIT_CARD = 'Credit Card',
  PAYPAL = 'Paypal',
}

export interface PriceDetail {
  salePrice?: number;
  rentalPrice?: number;
  pricePerSquareMeter?: number;
  currency: Currency;
  depositAmount?: number;
  maintenanceFee: number;
  paymentMethods: string[];
}

export interface Amenity {
  parking: boolean;
  elevator: boolean;
  swimmingPool: boolean;
  gym: boolean;
  securitySystem: boolean;
  airConditioning: boolean;
  balcony: boolean;
  garden: boolean;
  playground: boolean;
  backupGenerator: boolean;
}

//TODO: fixin field transaction history
export interface TransactionHistory {
  transactionDate: string;
  transactionType: string;
  price: number;
  buyerId: {
    timestamp: string;
    creationTime: string;
  };
  sellerId: {
    timestamp: string;
    creationTime: string;
  };
}

export interface Service {
  id: string;
  salerId: string;
  name: string;
  description: string;
  transactionType: TransactionType;
  type: ServiceType;
  status: ServiceStatus;
  adminNote: string;
  code: string;
  owner: Owner;
  location: Location;
  propertyDetails: PropertyDetail;
  priceDetails: PriceDetail;
  amenities: Amenity;
  imageUrls: string[];
  yearBuilt: number;
  legalDocumentUrls: string[];
  transactionHistory?: TransactionHistory[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
}

// Property search parameters
export interface ServiceSearchParams {
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
  isDescending?: boolean;
  status?: string;
  type?: string;
  transactionType?: TransactionType;
  // Property attributes
  bedrooms?: number;
  bathrooms?: number;
  livingRooms?: number;
  kitchens?: number;
  landArea?: number;
  landWidth?: number;
  landLength?: number;
  buildingArea?: number;
  numberOfFloors?: number;
  floorNumber?: number;
  apartmentOrientation?: string;
  // Additional search parameters for filtering
  // minPrice?: number;
  // maxPrice?: number;
  // minLandArea?: number;
  // maxLandArea?: number;
  // yearBuilt?: number;
  // minYearBuilt?: number;
  // maxYearBuilt?: number;
  // city?: string;
  // district?: string;
  // location?: string;
  // Filters
  propertyDetailFilters?: string | string[];
  amenityFilters?: string | string[];
}

export interface ServiceDetailRequest {
  name: string;
  description: string;
  transactionType: TransactionType;
  type: ServiceType;
  status: ServiceStatus;
  adminNote?: string;
  code: string;
  ownerId: string;
  location: Location;
  propertyDetails: PropertyDetail;
  priceDetails: PriceDetail;
  amenities: Amenity;
  images: File[];
  yearBuilt: number;
  legalDocuments: File[];
  transactionId: string;
}

// API response types
export interface ServiceResponse {
  code: string;
  status: boolean;
  message: string;
  data: {
    count: number;
    limit: number;
    page: number;
    totalPages: number;
    services: Service[];
  };
}

export interface ServiceDetailResponse {
  code: string;
  status: boolean;
  message: string;
  data: Service;
}

export interface ActionServiceResponse {
  code: string;
  status: boolean;
  message: string;
  data?: string;
}

// Convert ServiceSearchParams to RequestParams
const convertServiceFilters = (filters?: ServiceSearchParams): RequestParams => {
  if (!filters) return {};

  const params: RequestParams = {};

  // Add simple parameters
  if (filters.searchTerm) params.searchTerm = filters.searchTerm;
  if (filters.pageNumber !== undefined) params.pageNumber = filters.pageNumber;
  if (filters.pageSize !== undefined) params.pageSize = filters.pageSize;
  if (filters.isDescending !== undefined) params.isDescending = filters.isDescending;
  if (filters.status) params.status = filters.status;
  if (filters.type) params.type = filters.type;
  if (filters.transactionType) params.transactionType = filters.transactionType;

  // Handle property attributes
  if (filters.bedrooms !== undefined) params.bedrooms = filters.bedrooms;
  if (filters.bathrooms !== undefined) params.bathrooms = filters.bathrooms;
  if (filters.livingRooms !== undefined) params.livingRooms = filters.livingRooms;
  if (filters.kitchens !== undefined) params.kitchens = filters.kitchens;
  if (filters.landArea !== undefined) params.landArea = filters.landArea;
  if (filters.landWidth !== undefined) params.landWidth = filters.landWidth;
  if (filters.landLength !== undefined) params.landLength = filters.landLength;
  if (filters.buildingArea !== undefined) params.buildingArea = filters.buildingArea;
  if (filters.numberOfFloors !== undefined) params.numberOfFloors = filters.numberOfFloors;
  if (filters.floorNumber !== undefined) params.floorNumber = filters.floorNumber;
  if (filters.apartmentOrientation) params.apartmentOrientation = filters.apartmentOrientation;

  // Handle array parameters
  if (filters.propertyDetailFilters) {
    params.propertyDetailFilters = Array.isArray(filters.propertyDetailFilters)
      ? filters.propertyDetailFilters
      : [filters.propertyDetailFilters];
  }
  if (filters.amenityFilters) {
    params.amenityFilters = Array.isArray(filters.amenityFilters)
      ? filters.amenityFilters
      : [filters.amenityFilters];
  }

  return params;
};

// Property service with typed API methods
export const propertyService = {
  // Get all properties with filters
  getServices: async (filters?: ServiceSearchParams): Promise<ServiceResponse> => {
    const params = convertServiceFilters(filters);
    const response = await apiService.get<ServiceResponse>('/services', params);
    return response.data;
  },

  // Get a single property by ID
  getService: async (id: string): Promise<ServiceDetailResponse> => {
    const response = await apiService.get<ServiceDetailResponse>(`/services/${id}`);
    return response.data;
  },

  // Create a new property
  createService: async (service: Partial<ServiceDetailRequest>): Promise<ActionServiceResponse> => {
    const response = await apiService.post<ActionServiceResponse>('/services', service);
    return response.data;
  },

  // Update an existing property
  updateService: async (id: string, service: Partial<Service>): Promise<ActionServiceResponse> => {
    const response = await apiService.put<ActionServiceResponse>(`/services/${id}`, service);
    return response.data;
  },

  // Delete a property
  deleteService: async (id: string): Promise<ActionServiceResponse> => {
    const response = await apiService.delete<ActionServiceResponse>(`/services/${id}`);
    return response.data;
  },
};

export default propertyService;
