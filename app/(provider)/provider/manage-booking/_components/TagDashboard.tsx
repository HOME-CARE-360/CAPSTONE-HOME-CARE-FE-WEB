import TagCard from '@/app/(provider)/provider/manage-booking/_components/TagCard';
import { type LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
// Mock data - sẽ lấy từ API
export const bookingStats = {
  pending: 12,
  inProgress: 8,
  completed: 156,
  revenue: 15420,
  avgRating: 4.8,
  monthlyGrowth: 12,
};

interface Sections {
  id: number;
  name: string;
  bookingStatus: number;
  icon: LucideIcon;
  colorIcon: string;
}

const sections: Sections[] = [
  {
    id: 1,
    name: 'Chờ xử lý',
    bookingStatus: bookingStats.pending,
    icon: AlertCircle,
    colorIcon: 'text-yellow-500',
  },
  {
    id: 2,
    name: 'Đang thực hiện',
    bookingStatus: bookingStats.inProgress,
    icon: AlertCircle,
    colorIcon: 'text-yellow-500',
  },
  {
    id: 3,
    name: 'Hoàn thành',
    bookingStatus: bookingStats.completed,
    icon: AlertCircle,
    colorIcon: 'text-green-500',
  },
  {
    id: 4,
    name: 'Đánh giá trung bình',
    bookingStatus: bookingStats.avgRating,
    icon: AlertCircle,
    colorIcon: 'text-yellow-500',
  },
  {
    id: 5,
    name: 'Tăng trưởng',
    bookingStatus: bookingStats.monthlyGrowth,
    icon: AlertCircle,
    colorIcon: 'text-green-500',
  },
];
export default function TagDashboard() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {sections.map(section => (
        <TagCard
          key={section.id}
          name={section.name}
          bookingStatus={section.bookingStatus}
          icon={section.icon}
          colorIcon={section.colorIcon}
        />
      ))}
    </div>
  );
}
