import { Service, TransactionType, ApartmentOrientation } from '@/lib/api/services/fetchService';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import {
  BedDouble,
  Bath,
  Home,
  Calendar,
  MapPin,
  CheckCircle,
  Car,
  ArrowUpDown,
  Waves,
  Dumbbell,
  Shield,
  Wind,
  Building,
  Trees,
  PlayCircle,
  Power,
  Building2,
  HomeIcon,
  Store,
  LandPlot,
  Compass,
  DollarSign,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ServiceDetailsSectionProps {
  service: Service;
}

export default function ServiceDetailsSection({ service }: ServiceDetailsSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Header with Property Info */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col md:w-1/2">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{service.name}</h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1 text-red-600" />
            <span>
              {service.location.address}, {service.location.district}, {service.location.city}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {t('service_detail.service_code')}: {service.code}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:w-1/2 items-end">
          <div className="flex flex-col items-end">
            <span className="text-sm text-muted-foreground">
              {t('service_detail.listing_price')}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-red-600">
              {formatCurrency(service.priceDetails.salePrice || 0)}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start my-16">
        <div className="border-2 h-auto border-red-400/50 rounded-2xl p-6 bg-background/50 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Home className="h-5 w-5 text-red-600" />
            {t('property_detail.description')}
          </h2>
          <p className="text-muted-foreground mb-6 font-sans font-light leading-relaxed">
            {service.description}
          </p>

          <h3 className="text-xl font-semibold">{t('service_detail.service_information')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-4">
            <ServiceSpec
              icon={<BedDouble className="h-6 w-6 text-red-600" />}
              value={service.propertyDetails.bedrooms}
              label={t('property_card.bedrooms')}
            />
            <ServiceSpec
              icon={<Bath className="h-6 w-6 text-red-600" />}
              value={service.propertyDetails.bathrooms}
              label={t('property_card.bathrooms')}
            />
            <ServiceSpec
              icon={<Home className="h-6 w-6 text-red-600" />}
              value={`${service.propertyDetails.buildingArea} m²`}
              label={t('property_detail.land_area')}
            />
            <ServiceSpec
              icon={<Calendar className="h-6 w-6 text-red-600" />}
              value={service.yearBuilt}
              label={t('service_detail.year_built')}
            />
          </div>

          <div className="bg-red-50/50 p-4 rounded-lg border-2 border-red-300">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />
              {t('property_detail.location_details')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('property_detail.address')}</p>
                <p className="font-medium">{service.location.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('service_detail.city')}</p>
                <p className="font-medium">{service.location.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('service_detail.district')}</p>
                <p className="font-medium">{service.location.district}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('service_detail.ward')}</p>
                <p className="font-medium">{service.location.ward}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-red-200/50 rounded-2xl bg-background/50 hover:shadow-lg transition-shadow duration-300">
            <div className="px-6 py-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-red-600" />
                {t('service_detail.features_amenities')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(service.amenities).map(
                  ([amenity, isAvailable], index) =>
                    isAvailable && (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border-2 border-red-300 hover:border-red-400 transition-colors"
                      >
                        {amenity === 'parking' && (
                          <Car className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        {amenity === 'elevator' && (
                          <ArrowUpDown className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        {amenity === 'swimmingPool' && (
                          <Waves className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        {amenity === 'gym' && (
                          <Dumbbell className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        {amenity === 'securitySystem' && (
                          <Shield className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        {amenity === 'airConditioning' && (
                          <Wind className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        {amenity === 'balcony' && (
                          <Building className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        {amenity === 'garden' && (
                          <Trees className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        {amenity === 'playground' && (
                          <PlayCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        {amenity === 'backupGenerator' && (
                          <Power className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium capitalize">
                            {amenity === 'parking' && 'Bãi đỗ xe'}
                            {amenity === 'elevator' && 'Thang máy'}
                            {amenity === 'swimmingPool' && 'Hồ bơi'}
                            {amenity === 'gym' && 'Phòng gym'}
                            {amenity === 'securitySystem' && 'Hệ thống an ninh'}
                            {amenity === 'airConditioning' && 'Điều hòa'}
                            {amenity === 'balcony' && 'Ban công'}
                            {amenity === 'garden' && 'Vườn'}
                            {amenity === 'playground' && 'Sân chơi'}
                            {amenity === 'backupGenerator' && 'Máy phát điện dự phòng'}
                          </p>
                          <p className="text-sm text-muted-foreground">Có sẵn</p>
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>

          <div className="border border-red-200/50 rounded-2xl bg-background/50 p-6 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4">{t('service_detail.service_details')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem
                label={t('service_detail.property_type')}
                value={
                  <div className="flex items-center gap-2">
                    {service.type === 'Apartment' && <Building2 className="h-5 w-5 text-red-600" />}
                    {service.type === 'Villa' && <HomeIcon className="h-5 w-5 text-red-600" />}
                    {service.type === 'ShopHouse' && <Store className="h-5 w-5 text-red-600" />}
                    {service.type === 'LandPlot' && <LandPlot className="h-5 w-5 text-red-600" />}
                    <span>
                      {service.type === 'Apartment' && 'Căn hộ'}
                      {service.type === 'Villa' && 'Biệt thự'}
                      {service.type === 'ShopHouse' && 'Nhà phố'}
                      {service.type === 'LandPlot' && 'Đất nền'}
                    </span>
                  </div>
                }
              />
              <DetailItem
                label={t('property_detail.status')}
                value={
                  <div className="flex items-center gap-2">
                    {service.status === 'Available' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {service.status === 'Pending' && (
                      <Calendar className="h-5 w-5 text-yellow-600" />
                    )}
                    {service.status === 'Sold' && <CheckCircle className="h-5 w-5 text-red-600" />}
                    {service.status === 'Rented' && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                    <span>
                      {service.status === 'Available' && 'Có sẵn'}
                      {service.status === 'Pending' && 'Đang xử lý'}
                      {service.status === 'Sold' && 'Đã bán'}
                      {service.status === 'Rented' && 'Đã cho thuê'}
                    </span>
                  </div>
                }
              />
              <DetailItem
                label={t('property_detail.transaction_type')}
                value={
                  <div className="flex items-center gap-2">
                    {service.transactionType === TransactionType.FOR_SALE && (
                      <DollarSign className="h-5 w-5 text-red-600" />
                    )}
                    {service.transactionType === TransactionType.FOR_RENT && (
                      <Calendar className="h-5 w-5 text-red-600" />
                    )}
                    <span>
                      {service.transactionType === TransactionType.FOR_SALE && 'Bán'}
                      {service.transactionType === TransactionType.FOR_RENT && 'Cho thuê'}
                    </span>
                  </div>
                }
              />
              <DetailItem label={t('service_detail.code')} value={service.code} />
              <DetailItem
                label={t('service_detail.living_rooms')}
                value={service.propertyDetails.livingRooms}
              />
              <DetailItem
                label={t('service_detail.kitchens')}
                value={service.propertyDetails.kitchens}
              />
              <DetailItem
                label={t('service_detail.land_area')}
                value={`${service.propertyDetails.landArea} m²`}
              />
              <DetailItem
                label={t('service_detail.land_width')}
                value={`${service.propertyDetails.landWidth} m`}
              />
              <DetailItem
                label={t('service_detail.land_length')}
                value={`${service.propertyDetails.landLength} m`}
              />
              <DetailItem
                label={t('service_detail.floors')}
                value={service.propertyDetails.numberOfFloors}
              />
              <DetailItem
                label={t('service_detail.basement')}
                value={
                  service.propertyDetails.hasBasement
                    ? t('service_detail.yes')
                    : t('service_detail.no')
                }
              />
              <DetailItem
                label={t('service_detail.furnished')}
                value={
                  service.propertyDetails.furnished
                    ? t('service_detail.yes')
                    : t('service_detail.no')
                }
              />
              <DetailItem
                label={t('service_detail.orientation')}
                value={
                  <div className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-red-600" />
                    <span>
                      {service.propertyDetails.apartmentOrientation ===
                        ApartmentOrientation.NORTH && 'Hướng Bắc'}
                      {service.propertyDetails.apartmentOrientation ===
                        ApartmentOrientation.SOUTH && 'Hướng Nam'}
                      {service.propertyDetails.apartmentOrientation === ApartmentOrientation.EAST &&
                        'Hướng Đông'}
                      {service.propertyDetails.apartmentOrientation === ApartmentOrientation.WEST &&
                        'Hướng Tây'}
                      {service.propertyDetails.apartmentOrientation ===
                        ApartmentOrientation.NORTHEAST && 'Hướng Đông Bắc'}
                      {service.propertyDetails.apartmentOrientation ===
                        ApartmentOrientation.NORTHWEST && 'Hướng Tây Bắc'}
                      {service.propertyDetails.apartmentOrientation ===
                        ApartmentOrientation.SOUTHEAST && 'Hướng Đông Nam'}
                      {service.propertyDetails.apartmentOrientation ===
                        ApartmentOrientation.SOUTHWEST && 'Hướng Tây Nam'}
                    </span>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ServiceSpec({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center bg-red-50/50 p-4 rounded-lg border-2 border-red-300">
      <div className="mb-2">{icon}</div>
      <p className="font-bold text-lg">{value}</p>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between p-3 bg-red-50/50 rounded-md border border-red-300">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
