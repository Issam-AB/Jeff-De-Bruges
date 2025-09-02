import { Product } from '@/types'
import prisma from '@/lib/prisma'

export async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        ref: true,
        name: true,
        slug: true,
        dimensions: true,
        mainCategory: true,
        subCategory: true,
        initialPrice: true,
        VenteflashPrice: true,
        mainImage: true,
        gallery: true,
        isActive: true,
        isArticleRouge: true,
        articleRougePrice: true,
        store: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    // Debug logging
    console.log('Raw products from DB:', products)
    console.log('Article Rouge products:', products.filter(p => p.isArticleRouge))
    
    // Transform the data to match the Product type
    const transformedProducts = products.map(product => {
      // Determine the VenteflashPrice based on product type and available prices
      let finalVenteflashPrice: number;
      if (product.isArticleRouge && product.articleRougePrice !== null) {
        finalVenteflashPrice = product.articleRougePrice;
      } else {
        finalVenteflashPrice = product.VenteflashPrice ?? product.initialPrice;
      }

      return {
        ...product,
        isArticleRouge: product.isArticleRouge ?? false,
        articleRougePrice: product.articleRougePrice ?? null,
        store: product.store ?? null,
        VenteflashPrice: finalVenteflashPrice
      };
    }) as Product[];

    return transformedProducts;
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
} 