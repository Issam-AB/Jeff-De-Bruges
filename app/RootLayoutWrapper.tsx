'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'

export default function RootLayoutWrapper({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Header />}
      <main className={`flex-grow ${!isAdminRoute ? 'pt-[80px]' : ''}`}>
        {children}
      </main>
    </div>
  )
} 