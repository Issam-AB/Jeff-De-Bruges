export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import ProductGrid from '@/components/ProductGrid'
import { notFound } from 'next/navigation'
import { Product } from '@/types'

interface PageProps {
  params: {
    category: string
  }
}

async function getProducts(category: string) {
  try {
    // Decode the URL-encoded category name
    const decodedCategory = decodeURIComponent(category);
    
    let products;
    // For 'tous' category, return all products - make case insensitive
    if (decodedCategory.toLowerCase() === 'tous' || decodedCategory.toUpperCase() === 'TOUS') {
      products = await prisma.product.findMany({
        where: {
          isActive: true
        },
        orderBy: [
          { isTopProduct: 'desc' },
          { createdAt: 'desc' }
        ]
      })
    } else {
      // For other categories
      products = await prisma.product.findMany({
        where: {
          mainCategory: {
            equals: decodedCategory,
            mode: 'insensitive'
          },
          isActive: true
        },
        orderBy: [
          { isTopProduct: 'desc' },
          { createdAt: 'desc' }
        ]
      })
    }

    // Transform the data to match the Product type
    return products.map(product => ({
      ...product,
      isArticleRouge: product.isArticleRouge ?? false,
      articleRougePrice: product.articleRougePrice ?? null,
      store: product.store ?? null,
      isTopProduct: product.isTopProduct ?? false,
      // If VenteflashPrice is null, use initialPrice
      VenteflashPrice: product.VenteflashPrice ?? product.initialPrice
    })) as Product[]

  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const products = await getProducts(params.category)

  if (!products.length) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <ProductGrid products={products} />
    </div>
  )
} 