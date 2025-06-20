import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/lib/providers/queryProvider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HomeCare 360 - Your Comprehensive Home Service Solution',
  description:
    'In the modern busy life, households increasingly require flexible, quick, and personalized home services. Traditional booking methods are often inefficient, inconvenient, and lack transparency. HomeCare 360 is designed to be a comprehensive platform where users can book essential home services like cleaning, repair, maintenance, and in-home healthcare, powered by AI, Machine Learning, and electronic payment integration. Beyond simple booking, HomeCare 360 ensures end-to-end service management through an integrated Service Fulfillment Workflow, quality tracking, feedback collection, and customer satisfaction monitoring, delivering a complete smart home service experience.',
  applicationName: 'HomeCare 360',
  authors: [{ name: 'HomeCare 360', url: 'https://www.homecare360.com' }],
  keywords: [
    'HomeCare 360',
    'home services',
    'cleaning',
    'repair',
    'maintenance',
    'healthcare',
    'AI',
    'Machine Learning',
    'smart home',
  ],
  creator: 'HomeCare 360 Team',
  publisher: 'HomeCare 360',
  openGraph: {
    title: 'HomeCare 360 - Your Comprehensive Home Service Solution',
    description:
      'In the modern busy life, households increasingly require flexible, quick, and personalized home services. Traditional booking methods are often inefficient, inconvenient, and lack transparency. HomeCare 360 is designed to be a comprehensive platform where users can book essential home services like cleaning, repair, maintenance, and in-home healthcare, powered by AI, Machine Learning, and electronic payment integration.',
    url: 'https://www.homecare360.com',
    siteName: 'HomeCare 360 Official Website',
    images: [
      {
        url: '/homecare360_logo.png',
        width: 1200,
        height: 630,
        alt: 'HomeCare 360 Service Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HomeCare360',
    title: 'HomeCare 360 - Your Comprehensive Home Service Solution',
    description:
      'In the modern busy life, households increasingly require flexible, quick, and personalized home services. Traditional booking methods are often inefficient, inconvenient, and lack transparency.',
    images: [
      {
        url: '/homecare360_logo.png',
        alt: 'HomeCare 360 Service Banner',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/homecare360_logo.png',
    apple: '/homecare360_logo.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#1E293B',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <main>{children}</main>
          </QueryProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
