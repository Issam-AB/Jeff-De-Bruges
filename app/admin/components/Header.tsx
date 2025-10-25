'use client'

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import Image from 'next/image';

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // First remove the cookie
      Cookies.remove('adminAuthenticated', { path: '/' });
      
      // Then call the logout API endpoint
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Force a router refresh and redirect
      router.refresh();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="h-16 bg-gray-800 dark:bg-gray-800 border-b border-gray-700 dark:border-gray-700 flex items-center justify-between px-6">
      <div className="relative w-[150px] h-[60px]">
        <Image
          src="/bf-logo.webp"
          alt="SKETCH BLACK FRIDAY Logo"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-700"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        Logout
      </Button>
    </header>
  );
} 