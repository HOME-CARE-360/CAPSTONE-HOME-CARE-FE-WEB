import { Service } from '@/lib/api/services/fetchService';
import { formatCurrency } from '@/utils/numbers/formatCurrency';
import { Home, Calendar, CheckCircle, DollarSign } from 'lucide-react';

interface ServiceDetailsSectionProps {
  service: Service;
}

export default function ServiceDetailsSection({ service }: ServiceDetailsSectionProps) {
  return (
    <>
      {/* Header with Service Info */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-col md:w-1/2">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{service.name}</h1>
        </div>

        <div className="flex flex-col md:w-1/2 items-end">
          <div className="flex flex-col items-end">
            <span className="text-sm text-muted-foreground">Giá niêm yết</span>

            <span className="text-2xl md:text-3xl font-bold text-red-600">
              {formatCurrency(service.virtualPrice)}
            </span>
            {/* {service.basePrice > service.virtualPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(service.basePrice)}
              </span>
            )} */}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start my-16">
        <div className="border-2 h-auto border-red-400/50 rounded-2xl p-6 bg-background/50 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Home className="h-5 w-5 text-red-600" />
            Mô tả
          </h2>
          <p className="text-muted-foreground mb-6 font-sans font-light leading-relaxed">
            {service.description}
          </p>

          <h3 className="text-xl font-semibold">Thông tin dịch vụ</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-4">
            <ServiceSpec
              icon={<DollarSign className="h-6 w-6 text-red-600" />}
              value={formatCurrency(service.virtualPrice)}
              label="Giá"
            />
            <ServiceSpec
              icon={<Calendar className="h-6 w-6 text-red-600" />}
              value={`${service.durationMinutes} phút`}
              label="Thời gian"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-red-200/50 rounded-2xl bg-background/50 hover:shadow-lg transition-shadow duration-300">
            <div className="px-6 py-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-red-600" />
                Danh mục
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border-2 border-red-300 hover:border-red-400 transition-colors"
                  >
                    <div>
                      <p className="font-medium capitalize">{category.name}</p>
                    </div>
                  </div>
                ))}
              </div>
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
