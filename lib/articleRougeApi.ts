import { Product } from '@/types'
import { prisma } from './prisma'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Keep accented characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces with dashes
    .replace(/\s+/g, '-')
    // Remove special characters except dashes
    .replace(/[^a-z0-9-]/g, '')
}

export async function getArticleRougeProducts(): Promise<Product[]> {
  try {
    const rawProducts = await prisma.product.findMany({
      where: {
        isArticleRouge: true,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the Product type
    return rawProducts.map(product => ({
      ...product,
      isArticleRouge: product.isArticleRouge ?? false,
      articleRougePrice: product.articleRougePrice ?? null,
      store: product.store ?? null,
      // If VenteflashPrice is null, use initialPrice
      VenteflashPrice: product.VenteflashPrice ?? product.initialPrice
    })) as Product[]

  } catch (error) {
    console.error('Error fetching article rouge products:', error)
    return []
  }
}

export async function getArticleRougeBySlug(slug: string): Promise<Product | null> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isArticleRouge: true,
        isActive: true
      }
    })

    const rawProduct = products.find(product => {
      const productSlug = generateSlug(product.name)
      return productSlug === slug
    })

    if (!rawProduct) return null

    // Transform the data to match the Product type
    return {
      ...rawProduct,
      isArticleRouge: rawProduct.isArticleRouge ?? false,
      articleRougePrice: rawProduct.articleRougePrice ?? null,
      store: rawProduct.store ?? null,
      VenteflashPrice: rawProduct.VenteflashPrice ?? rawProduct.initialPrice
    }

  } catch (error) {
    console.error('Error fetching article rouge by slug:', error)
    return null
  }
} 