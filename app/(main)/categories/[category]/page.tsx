import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'

interface PageProps {
  params: {
    category: string
  }
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categoryName = decodeURIComponent(params.category)
  
  return {
    title: `${categoryName} - Jeff De Bruges`,
    description: `Découvrez notre collection ${categoryName} de chocolats et boîtes cadeaux Jeff De Bruges`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const categorySlug = decodeURIComponent(params.category)
  
  // If "tous", redirect to /categories/tous
  if (categorySlug === 'tous') {
    return null // Will be handled by the tous page
  }
  
  // Get all categories to find the matching one
  const allCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })
  
  // Find category by slug (normalize slug generation)
  const normalizeSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-')
  }
  
  const matchingCategory = allCategories.find(cat => 
    normalizeSlug(cat.name) === categorySlug
  )
  
  if (!matchingCategory) {
    notFound()
  }
  
  const categoryName = matchingCategory.name
  
  // Get products in this category
  const products = await prisma.product.findMany({
    where: {
      mainCategory: categoryName,
      isActive: true
    },
    orderBy: [
      { isPremium: 'desc' },
      { isGiftBox: 'desc' },
      { initialPrice: 'desc' }
    ]
  })

  if (products.length === 0) {
    notFound()
  }


  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Simple Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {categoryName}
          </h1>
        </div>

        {/* Clean Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                VenteflashPrice: product.VenteflashPrice || product.initialPrice,
                isArticleRouge: product.isArticleRouge || false,
                articleRougePrice: product.articleRougePrice || null,
                store: product.store || null,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
