import Image from 'next/image';
import { Service, TransactionType } from '@/lib/api/services/fetchService';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface ServiceCardProps {
  service: Service;
  priority?: boolean;
}

export function ServiceCard({ service, priority = false }: ServiceCardProps) {
  const { t } = useTranslation();

  return (
    <Link href={`/services/${service.id}`}>
      <Card className="overflow-hidden border-red-100 hover:border-red-300 hover:shadow-md transition-all duration-300 h-full flex flex-col">
        <div className="relative h-64 w-full">
          <Image
            src={service.imageUrls[0] || '/placeholder-property.jpg'}
            alt={service.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge
              variant="outline"
              className="bg-white/90 backdrop-blur-sm hover:bg-white/90 text-red-600 border-red-200"
            >
              {service.type}
            </Badge>
            {/* {property.status && (
              <Badge
                variant="outline"
                className={`backdrop-blur-sm ${
                  property.status === 'Available'
                    ? 'bg-green-500/80 hover:bg-green-500/80'
                    : property.status === 'Pending'
                      ? 'bg-yellow-500/80 hover:bg-yellow-500/80'
                      : property.status === 'Sold'
                        ? 'bg-red-500/80 hover:bg-red-500/80'
                        : 'bg-blue-500/80 hover:bg-blue-500/80'
                }`}
              >
                {property.status}
              </Badge>
            )} */}
            <Badge
              variant="outline"
              className="bg-white/90 backdrop-blur-sm hover:bg-white/90 text-red-600 border-red-200"
            >
              {service.transactionType === TransactionType.FOR_SALE
                ? t('property_card.for_sale')
                : t('property_card.for_rent')}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-2 flex-grow">
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <MapPin className="h-4 w-4 mr-1 text-red-600" />
            <span>
              {service.location?.city || 'Location unavailable'}, {service.location?.district}
            </span>
          </div>
          <CardTitle className="text-xl line-clamp-1 group-hover:text-red-600 transition-colors duration-300">
            {service.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
            {service.description}
          </p>

          <div className="flex justify-between items-center text-sm border-t border-red-100 pt-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1 text-red-600" />
                <span>
                  {service.propertyDetails.bedrooms} {t('property_card.bedrooms')}
                </span>
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1 text-red-600" />
                <span>
                  {service.propertyDetails.bathrooms} {t('property_card.bathrooms')}
                </span>
              </div>
              <div className="flex items-center">
                <Maximize className="h-4 w-4 mr-1 text-red-600" />
                <span>{service.propertyDetails.buildingArea} m²</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-2 mt-auto">
          <div>
            <p className="text-xs text-muted-foreground">
              {service.transactionType === TransactionType.FOR_SALE
                ? t('property_card.price')
                : t('property_card.rent_price')}
            </p>
            <p className="text-xl font-semibold text-red-600">
              {formatCurrency(
                service.transactionType === TransactionType.FOR_SALE
                  ? service.priceDetails.salePrice || 0
                  : service.priceDetails.rentalPrice || 0
              )}
              {service.transactionType === TransactionType.FOR_RENT && (
                <span className="text-sm">/tháng</span>
              )}
            </p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">{t('property_card.view_details')}</Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
