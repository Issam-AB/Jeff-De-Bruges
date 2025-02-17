import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import PageLayout from '@/components/PageLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TopDeals - Meubles & Déco',
  description: 'Découvrez notre sélection de meubles et déco à prix imbattables',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-50`}>
        <PageLayout>
          {children}
        </PageLayout>
        <Analytics />
      </body>
    </html>
  )
}
