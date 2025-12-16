import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ChocolateProductView from '@/components/ChocolateProductView'
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
      return { title: 'Produit Introuvable - Jeff De Bruges' }
    }

    return {
      title: `${product.name} - Jeff De Bruges`,
      description: product.description || `${product.name} - ${product.subCategory} - ${product.dimensions}`,
      openGraph: { 
        images: [product.mainImage],
        title: product.name,
        description: product.description || `Chocolat ${product.mainCategory}`,
      }
    }
  } catch (error) {
    console.error('Error fetching product metadata:', error)
    return { title: 'Jeff De Bruges - Chocolaterie' }
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
    VenteflashPrice: rawProduct.VenteflashPrice ?? rawProduct.initialPrice,
    // Ensure new fields are included
    description: rawProduct.description ?? null,
    weight: rawProduct.weight ?? null,
    weightUnit: rawProduct.weightUnit ?? null,
    quantity: rawProduct.quantity ?? null,
    chocolateType: rawProduct.chocolateType ?? null,
    ingredients: rawProduct.ingredients ?? [],
    allergens: rawProduct.allergens ?? [],
    tags: rawProduct.tags ?? [],
    stock: rawProduct.stock ?? 0,
    sku: rawProduct.sku ?? null,
    expirationDays: rawProduct.expirationDays ?? null,
    isGiftBox: rawProduct.isGiftBox ?? false,
    isPremium: rawProduct.isPremium ?? false,
    brand: rawProduct.brand ?? null,
    material: rawProduct.material ?? null,
    shape: rawProduct.shape ?? null,
  }

  return <ChocolateProductView product={product} />
}
  