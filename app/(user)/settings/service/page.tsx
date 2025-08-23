'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetServiceSuggestions } from '@/hooks/useUser';
import { formatDate } from '@/utils/numbers/formatDate';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { Eye, XCircle, Star, Building2, TrendingUp, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function ServiceSuggestionsPage() {
  const { data, isLoading, error } = useGetServiceSuggestions();

  const suggestions = data?.data || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'NEW':
        return { label: 'Mới', variant: 'default' as const, icon: <Star className="w-4 h-4" /> };
      case 'VIEWED':
        return {
          label: 'Đã xem',
          variant: 'secondary' as const,
          icon: <Eye className="w-4 h-4" />,
        };
      default:
        return { label: status, variant: 'outline' as const, icon: <Clock className="w-4 h-4" /> };
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Không thể tải gợi ý dịch vụ</h3>
              <p className="text-muted-foreground">Vui lòng thử lại sau</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gợi ý dịch vụ</h1>
          <p className="text-muted-foreground">Khám phá các sản phẩm phù hợp với nhu cầu của bạn</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="w-4 h-4" />
            {suggestions.length} gợi ý
          </Badge>
        </div>
      </div>

      {/* Suggestions Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video relative">
                <Skeleton className="w-full h-full" />
              </div>
              <CardHeader className="pb-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestions.map(suggestion => {
            const statusConfig = getStatusConfig(suggestion.status);

            return (
              <Card
                key={suggestion.id}
                className={`overflow-hidden hover:shadow-lg transition-all duration-300`}
              >
                {/* Product Image */}
                <div className="aspect-video relative overflow-hidden">
                  <Image
                    src={suggestion.ExternalProduct.imageUrl}
                    alt={suggestion.ExternalProduct.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={statusConfig.variant} className="gap-1">
                      {statusConfig.icon}
                      {statusConfig.label}
                    </Badge>
                  </div>
                  {suggestion.ExternalProduct.discountPct && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="destructive" className="font-semibold">
                        -{suggestion.ExternalProduct.discountPct}%
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold leading-tight line-clamp-2">
                      {suggestion.ExternalProduct.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {suggestion.ExternalProduct.brand} {suggestion.ExternalProduct.model}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <span className="text-sm font-medium">
                          {(suggestion.score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Price and Source */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">
                        {formatCurrency(
                          suggestion.ExternalProduct.price,
                          suggestion.ExternalProduct.currency
                        )}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.ExternalProduct.source}
                      </Badge>
                    </div>
                    {suggestion.ExternalProduct.promoEndsAt && (
                      <p className="text-xs text-muted-foreground">
                        Khuyến mãi kết thúc: {formatDate(suggestion.ExternalProduct.promoEndsAt)}
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {suggestion.reason}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(suggestion.ExternalProduct.url, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem chi tiết
                    </Button>
                  </div>

                  {/* Additional Actions */}
                  {/* <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleMarkAsPurchased(suggestion.id)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Đã mua
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleIgnoreSuggestion(suggestion.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Bỏ qua
                    </Button>
                  </div> */}

                  {/* Timestamps */}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Tạo: {formatDate(suggestion.createdAt)}</span>
                      <span>Cập nhật: {formatDate(suggestion.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Không có gợi ý dịch vụ</h3>
              <p className="text-muted-foreground">
                Chúng tôi sẽ cập nhật gợi ý mới dựa trên nhu cầu của bạn
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
