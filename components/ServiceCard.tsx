import Image from 'next/image';
import { Service } from '@/lib/api/services/fetchService';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ServiceCardProps {
  service: Service;
  priority?: boolean;
}

export function ServiceCard({ service, priority = false }: ServiceCardProps) {
  return (
    <Link href={`/services/${service.id}`}>
      <Card className="overflow-hidden border-red-100 hover:border-red-300 hover:shadow-md transition-all duration-300 h-full flex flex-col">
        <div className="relative h-64 w-full">
          <Image
            src={service.images[0] || '/placeholder-service.jpg'}
            alt={service.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            {service.categories.map(category => (
              <Badge
                key={category.name}
                variant="outline"
                className="bg-white/90 backdrop-blur-sm hover:bg-white/90 text-red-600 border-red-200"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        <CardHeader className="pb-2 flex-grow">
          <div className="flex items-center text-sm text-muted-foreground mb-1">
            <MapPin className="h-4 w-4 mr-1 text-red-600" />
            <span>{service.provider}</span>
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
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-red-600" />
              <span>{service.durationMinutes} phút</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center pt-2 mt-auto">
          <div>
            <p className="text-xs text-muted-foreground">Giá</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-semibold text-red-600">
                {formatCurrency(service.basePrice)}
              </p>
              {service.virtualPrice > service.basePrice && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatCurrency(service.virtualPrice)}
                </p>
              )}
            </div>
          </div>
          <Button className="bg-red-600 hover:bg-red-700">Xem chi tiết</Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
