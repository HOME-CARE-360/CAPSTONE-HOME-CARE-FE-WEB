import type { Metadata } from 'next';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/common/appSidebar';

export const metadata: Metadata = {
  title: 'Provider Dashboard',
  description: 'Service provider management dashboard',
};

export default function ProviderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar variant="inset" collapsible="icon" />
        <div className="flex-1 overflow-auto">
          <SidebarInset>{children}</SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
