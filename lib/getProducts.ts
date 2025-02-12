import { Product } from './types'
import prisma from '@/lib/prisma'

export async function getProducts(category?: string): Promise<{ products: Product[] }> {
  try {
    const products = await prisma.product.findMany({
      where: {
        mainCategory: category,
        isActive: true
      },
      select: {
        id: true,
        ref: true,
        slug: true,
        name: true,
        dimensions: true,
        mainCategory: true,
        subCategory: true,
        initialPrice: true,
        VenteflashPrice: true,
        mainImage: true,
        gallery: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return { products }
  } catch (error) {
    console.error('Error fetching products:', error)
    throw new Error('Failed to fetch products')
  }
}

