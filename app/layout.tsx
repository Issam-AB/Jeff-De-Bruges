import { Analytics } from '@vercel/analytics/react'
import "./globals.css"

export const metadata = {
  title: "SKETCH VENTE FLASH",
  description: "Les meilleures offres de meubles au Maroc - Ventes flash exclusives sur des meubles de qualité à prix imbattables",
  keywords: "meubles maroc, vente flash meubles, mobilier maroc, promotions meubles, meubles pas cher, sketch vente flash",
  authors: [{ name: 'Sketch design' }],
  openGraph: {
    title: 'SKETCH VENTE FLASH',
    description: 'Les meilleures offres de meubles au Maroc - Ventes flash exclusives sur des meubles de qualité à prix imbattables',
    url: 'https://venteflash.sketch-design.ma',
    siteName: 'SKETCH VENTE FLASH',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: 'https://venteflash.sketch-design.ma/vf.svg',
        width: 800,
        height: 600,
        alt: 'SKETCH VENTE FLASH Logo',
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
        url: "/vf.svg",
        href: "/vf.svg",
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
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
