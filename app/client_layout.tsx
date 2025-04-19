'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/ui/website/Navbar';
import Footer from '@/components/ui/website/Footer';
import { ToastContainer } from 'react-toastify';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <main className="h-full w-full flex flex-col md:flex-row overflow-x-hidden">
      <AppSidebar className="w-64 shrink-0" />
      <SidebarInset className="flex-grow flex flex-col overflow-x-hidden">
        <div className="flex-grow pb-20 bg-[#1e1f22]">
          <Navbar />
          {children}
          <ToastContainer position="bottom-right" autoClose={3000} />
        </div>
        {!isAdminPage && <Footer className="mt-auto" />}
      </SidebarInset>
    </main>
  );
}
