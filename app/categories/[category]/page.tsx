import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import ProductGrid from '@/components/ProductGrid'
import PageLayout from '@/components/PageLayout'
import { getCategoryBySlug, PREDEFINED_CATEGORIES } from '@/lib/categories'

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function getProducts(category: string) {
  try {
    // For 'tous' category, return all products - make case insensitive
    if (category.toLowerCase() === 'tous' || category.toUpperCase() === 'TOUS') {
      return await prisma.product.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    // Find the category in our predefined list
    const categoryConfig = PREDEFINED_CATEGORIES.find(c => 
      normalizeString(c.slug) === normalizeString(category)
    )

    if (!categoryConfig) return []

    // Get all possible subcategories
    const subcategories = categoryConfig.children?.map(child => child.name) || []
    subcategories.push(categoryConfig.name)

    // For specific categories
    return await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            mainCategory: {
              in: subcategories,
              mode: 'insensitive'
            }
          },
          {
            subCategory: {
              in: subcategories,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function CategoryPage({
  params
}: {
  params: { category: string }
}) {
  // Decode and normalize the category slug
  const decodedCategory = decodeURIComponent(params.category)
  const normalizedSlug = normalizeString(decodedCategory)
  
  // Find the category in our predefined list
  const category = await getCategoryBySlug(normalizedSlug)
  if (!category) return notFound()

  const products = await getProducts(normalizedSlug)

  return (
    <PageLayout>
      <ProductGrid 
        products={products} 
        category={category}
      />
    </PageLayout>
  )
} 