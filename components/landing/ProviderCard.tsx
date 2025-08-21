'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Award,
  MapPin,
  Phone,
  Mail,
  Star,
  Building2,
  TrendingUp,
  Shield,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import type { TopProvider } from '@/lib/api/services/fetchUser';

interface ProviderCardProps {
  provider: TopProvider;
  size?: 'sm' | 'md';
}

export function ProviderCard({ provider, size = 'md' }: ProviderCardProps) {
  const getProviderInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isSmall = size === 'sm';

  return (
    <Link href={`/service-provider/${provider.id}`}>
      <Card className="group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white">
        <CardContent className={`relative ${isSmall ? 'p-4' : 'p-6'}`}>
          {/* Verification Badge */}
          {provider.verificationStatus === 'VERIFIED' && (
            <div className="absolute top-3 right-3 z-20">
              <Badge className="bg-green-500 text-white border-0 px-2 py-1 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Đã xác thực
              </Badge>
            </div>
          )}

          {/* Provider Avatar & Basic Info */}
          <div className="flex items-start gap-3 mb-4 pt-8">
            <Avatar
              className={`${isSmall ? 'h-10 w-10' : 'h-12 w-12'} border-2 border-slate-100 shadow-sm`}
            >
              <AvatarFallback className="font-semibold">
                {getProviderInitials(provider.contact.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3
                className={`${isSmall ? 'text-lg' : 'text-xl'} font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 truncate mb-2`}
              >
                {provider.contact.name}
              </h3>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200 bg-green-50 px-2 py-1 text-xs"
                >
                  <Building2 className="w-3 h-3 mr-1" />
                  {provider.companyType}
                </Badge>
                {provider.industry && (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-200 bg-green-50 px-2 py-1 text-xs"
                  >
                    {provider.industry}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="truncate" title={provider.address}>
                {provider.address}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="truncate">{provider.contact.phone}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="truncate" title={provider.contact.email}>
                {provider.contact.email}
              </span>
            </div>
          </div>

          {/* Stats & Rating */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-slate-700">
                  {provider.completedBookingsCount}
                </span>
              </div>
              <span className="text-xs text-slate-500">đơn hoàn thành</span>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 transition-colors duration-200 ${
                    i < Math.min(provider.completedBookingsCount, 5)
                      ? 'text-yellow-400 fill-current'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <Badge className="bg-green-500 text-white border-0 px-2 py-1 text-xs">
                <Award className="w-3 h-3 mr-1" />
                Top {provider.rank}
              </Badge>

              <div className="flex items-center gap-1 text-green-600 text-sm font-medium group-hover:text-green-700 transition-colors">
                Xem chi tiết
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
