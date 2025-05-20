import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import serviceService from '@/lib/api/services/fetchService';

const inter = Inter({ subsets: ['latin'] });

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await serviceService.getService(params.id);
    const service = response.data;

    return {
      title: `${service.name} | ${service.type} in ${service.location.city}`,
      description: service.description,
      openGraph: {
        title: `${service.name} | ${service.type} in ${service.location.city}`,
        description: service.description,
        images: service.imageUrls[0] ? [service.imageUrls[0]] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${service.name} | ${service.type} in ${service.location.city}`,
        description: service.description,
        images: service.imageUrls[0] ? [service.imageUrls[0]] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Service Details | HomeCare',
      description: 'View detailed information about this service.',
    };
  }
}

export default function ServiceDetailLayout({ children }: { children: React.ReactNode }) {
  return <div className={inter.className}>{children}</div>;
}
