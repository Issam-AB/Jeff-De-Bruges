import { Analytics } from '@vercel/analytics/react'
import { Inter } from 'next/font/google'
import "./globals.css"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "SKETCH BLACK FRIDAY",
  description: "Les meilleures offres de meubles au Maroc - Black Friday exclusif sur des meubles de qualité à prix imbattables",
  keywords: "meubles maroc, black friday meubles, mobilier maroc, promotions meubles, meubles pas cher, sketch black friday",
  authors: [{ name: 'Sketch design' }],
  openGraph: {
    title: 'SKETCH BLACK FRIDAY',
    description: 'Les meilleures offres de meubles au Maroc - Black Friday exclusif sur des meubles de qualité à prix imbattables',
    url: 'https://venteflash.sketch-design.ma',
    siteName: 'SKETCH BLACK FRIDAY',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://venteflash.sketch-design.ma/bf-logo.webp',
        width: 800,
        height: 600,
        alt: 'SKETCH BLACK FRIDAY Logo',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'add-your-google-site-verification-here',
  },
  alternates: {
    canonical: 'https://venteflash.sketch-design.ma',
  },
  icons: {
    icon: [
      {
        url: "/bf-logo.webp",
        href: "/bf-logo.webp",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen bg-gray-900`}>
        {/* Animated background layers */}
        <div className="fixed inset-0 bg-gray-900" />
        <div className="fixed inset-0">
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(249, 115, 22) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(249, 115, 22) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          {/* Glowing orbs */}
          <div className="absolute top-0 left-1/4 w-24 h-24 bg-orange-500 rounded-full blur-[80px] animate-pulse opacity-20" />
          <div className="absolute top-0 right-1/4 w-24 h-24 bg-red-500 rounded-full blur-[80px] animate-pulse delay-700 opacity-20" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}