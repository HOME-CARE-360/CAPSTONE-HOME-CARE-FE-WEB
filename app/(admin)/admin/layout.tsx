import type { Metadata } from 'next';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/(admin)/components/AppSidebar';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Admin Management Dashboard',
};

export default function ManagerLayout({
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
