'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import Cookies from 'js-cookie';
import { Analytics } from '@vercel/analytics/react'
import { Inter } from 'next/font/google'
import "../globals.css"

const inter = Inter({ subsets: ['latin'] })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isAuthenticated = Cookies.get('adminAuthenticated');
    const isLoginPage = pathname === '/admin/login';

    if (!isAuthenticated && !isLoginPage) {
      router.push('/admin/login');
    } else if (isAuthenticated && isLoginPage) {
      router.push('/admin/products');
    }
  }, [pathname, router]);

  // Don't show the admin layout on the login page
  if (pathname === '/admin/login') {
    return <div className={inter.className}>{children}</div>;
  }

  return (
    <div className={inter.className}>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex h-[calc(100vh-64px)]">
          <Sidebar />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
      <Analytics />
    </div>
  )
} 