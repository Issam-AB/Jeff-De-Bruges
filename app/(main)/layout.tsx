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
    <>
      <Header />
      <div className="min-h-[100dvh] flex flex-col relative pt-[80px]" style={{ paddingTop: '80px' }}>
        <PageLayout>
          <Suspense fallback={<LoadingScreen />}>
            {children}
          </Suspense>
        </PageLayout>
      </div>
    </>
  )
} 