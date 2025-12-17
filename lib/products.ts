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
        isTopProduct: true,
        createdAt: true,
        updatedAt: true,
        // Champs chocolat
        description: true,
        weight: true,
        weightUnit: true,
        quantity: true,
        chocolateType: true,
        ingredients: true,
        allergens: true,
        tags: true,
        stock: true,
        sku: true,
        expirationDays: true,
        isGiftBox: true,
        isPremium: true,
        brand: true,
        material: true,
        shape: true,
      },
      orderBy: [
        { isTopProduct: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    
    // Debug logging
    console.log('Raw products from DB:', products.length)
    console.log('Top products:', products.filter(p => p.isTopProduct))
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
        isTopProduct: product.isTopProduct ?? false,
        VenteflashPrice: finalVenteflashPrice,
        // Champs chocolat avec valeurs par défaut
        description: product.description ?? null,
        weight: product.weight ?? null,
        weightUnit: product.weightUnit ?? null,
        quantity: product.quantity ?? null,
        chocolateType: product.chocolateType ?? null,
        ingredients: product.ingredients ?? [],
        allergens: product.allergens ?? [],
        tags: product.tags ?? [],
        stock: product.stock ?? 0,
        sku: product.sku ?? null,
        expirationDays: product.expirationDays ?? null,
        isGiftBox: product.isGiftBox ?? false,
        isPremium: product.isPremium ?? false,
        brand: product.brand ?? null,
        material: product.material ?? null,
        shape: product.shape ?? null,
      };
    }) as Product[];

    return transformedProducts;
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
} 