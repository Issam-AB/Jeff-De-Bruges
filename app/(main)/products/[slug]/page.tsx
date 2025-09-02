import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import QuickView from '@/components/QuickView'
import { notFound } from 'next/navigation'
import { Product } from '@/types'

interface PageProps {
  params: {
    slug: string
  }
}

// Force dynamic rendering for product pages
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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

export default async function ProductPage({ params }: PageProps) {
  const rawProduct = await prisma.product.findUnique({
    where: {
      slug: params.slug,
      isActive: true
    }
  })

  if (!rawProduct) {
    notFound()
  }

  // Transform the data to match the Product type
  const product: Product = {
    ...rawProduct,
    isArticleRouge: rawProduct.isArticleRouge ?? false,
    articleRougePrice: rawProduct.articleRougePrice ?? null,
    store: rawProduct.store ?? null,
    // If VenteflashPrice is null, use initialPrice
    VenteflashPrice: rawProduct.VenteflashPrice ?? rawProduct.initialPrice
  }

  return <QuickView product={product} fullPage={true} />
}

// Remove generateStaticParams to ensure dynamic routing
  