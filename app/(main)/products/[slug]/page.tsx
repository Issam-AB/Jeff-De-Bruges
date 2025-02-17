import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import QuickView from '@/components/QuickView'
import { notFound } from 'next/navigation'

interface Props {
  params: {
    slug: string
  }
}

// Force dynamic rendering for product pages
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug }
    })

    if (!product) {
      return { title: 'Product Not Found - Top Deal Maroc' }
    }

    return {
      title: `${product.name} - Top Deal Maroc`,
      description: `${product.name} - ${product.subCategory} - ${product.dimensions}`,
      openGraph: { images: [product.mainImage] }
    }
  } catch (error) {
    console.error('Error fetching product metadata:', error)
    return { title: 'Top Deal Maroc' }
  }
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug }
  })
  
  if (!product) {
    notFound()
  }

  return <QuickView product={product} fullPage={true} />
}

// Remove generateStaticParams to ensure dynamic routing
  