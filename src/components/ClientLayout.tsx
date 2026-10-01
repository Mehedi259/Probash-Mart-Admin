'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import clsx from 'clsx';
import { usePathname, useRouter } from 'next/navigation';

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasToken = !!getAccessToken();
    if (!hasToken && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  if (!mounted) return null;

  // Don't show sidebar and header on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Prevent rendering dashboard if not authenticated
  if (!getAccessToken()) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={clsx(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        "lg:ml-64" // Margin left on large screens to accommodate the fixed sidebar
      )}>
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
