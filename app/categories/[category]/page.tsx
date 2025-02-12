import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProductGrid from '@/components/ProductGrid'
import PageLayout from '@/components/PageLayout'
import { Product } from '@prisma/client'
import { ValidCategory } from '@/components/ProductGrid'

async function getProducts(category: string) {
  try {
    // Normalize the category: decode, remove accents, and convert to uppercase
    const decodedCategory = decodeURIComponent(category)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
    
    console.log('Processing category:', decodedCategory)

    // For 'TOUS' category, return all products
    if (decodedCategory === 'TOUS') {
      const products = await prisma.product.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      console.log(`Found ${products.length} products for TOUS`)
      return products
    }

    // For other categories, use case-insensitive search
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            mainCategory: {
              contains: decodedCategory,
              mode: 'insensitive'
            }
          },
          {
            subCategory: {
              contains: decodedCategory,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${products.length} products for category:`, decodedCategory)
    
    // Only return notFound if we're sure there are no products
    if (!products.length && decodedCategory !== 'TOUS') {
      console.log('No products found for category:', decodedCategory)
      return notFound()
    }

    return products
  } catch (error: any) {
    console.error('Error fetching products:', error)
    console.error('Error details:', error?.message || 'Unknown error')
    return []
  }
}

// Helper function to validate category
function isValidCategory(category: string | undefined): category is ValidCategory {
  if (!category) return false;
  
  const validCategories = [
    "Salon en L",
    "Salon en U",
    "Canapé 2 Places",
    "Canapé 3 Places",
    "Fauteuils",
    "Lits",
    "Matelas",
    "Table de Chevet",
    "Armoires",
    "Bibliothèques",
    "Buffets",
    "SALONS",
    "CHAMBRES",
    "RANGEMENTS",
    "TOUS"
  ] as const;
  
  return validCategories.includes(category as any);
}

export default async function CategoryPage({
  params
}: {
  params: { category: string }
}) {
  const normalizedCategory = decodeURIComponent(params.category)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
  
  const products = await getProducts(params.category)

  const validatedCategory = isValidCategory(normalizedCategory) ? normalizedCategory : undefined;

  return (
    <PageLayout>
      <ProductGrid 
        products={products} 
        category={validatedCategory === 'TOUS' ? undefined : validatedCategory} 
      />
    </PageLayout>
  )
} 