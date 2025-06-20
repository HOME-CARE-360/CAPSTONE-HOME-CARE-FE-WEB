import { Card, CardContent } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

interface Props {
  name: string;
  icon: LucideIcon;
  bookingStatus?: number;
  colorIcon?: string;
}

export default function TagCard({ name, icon: Icon, bookingStatus, colorIcon }: Props) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className={`h-8 w-8 ${colorIcon}`} />}
          <div>
            <div className="text-2xl font-bold">{bookingStatus}</div>
            <div className="text-sm text-muted-foreground">{name}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
