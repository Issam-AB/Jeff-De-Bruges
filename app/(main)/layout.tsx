import Header from '@/components/Header'
import { Suspense } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import PageLayout from '@/components/PageLayout'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <PageLayout>
        <Suspense fallback={<LoadingScreen />}>
          {children}
        </Suspense>
      </PageLayout>
    </div>
  )
} 