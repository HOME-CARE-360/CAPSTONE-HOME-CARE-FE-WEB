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
      title: `${service.name} | HomeCare360`,
      description: service.description,
      openGraph: {
        title: `${service.name} | HomeCare360`,
        description: service.description,
        images: service.images[0] ? [service.images[0]] : [],
        locale: 'vi_VN',
        alternateLocale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${service.name} | HomeCare360`,
        description: service.description,
        images: service.images[0] ? [service.images[0]] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Service Details | HomeCare360',
      description: 'View detailed information about this service.',
    };
  }
}

export default function ServiceDetailLayout({ children }: { children: React.ReactNode }) {
  return <div className={inter.className}>{children}</div>;
}
