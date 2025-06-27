import type { Metadata } from 'next';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/app/(manager)/components/AppSidebar';

export const metadata: Metadata = {
  title: 'Manager Dashboard',
  description: 'Manager Management Dashboard',
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
