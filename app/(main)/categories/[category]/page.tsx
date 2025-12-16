import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { Home, ChevronRight } from 'lucide-react'

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
  const categoryName = decodeURIComponent(params.category)
  
  // Get products in this category
  const products = await prisma.product.findMany({
    where: {
      mainCategory: {
        equals: categoryName,
        mode: 'insensitive'
      },
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

  // Get all unique subcategories
  const subCategories = Array.from(
    new Set(products.map(p => p.subCategory).filter(Boolean))
  ).sort()

  // Get category stats
  const stats = {
    total: products.length,
    premium: products.filter(p => p.isPremium).length,
    giftBox: products.filter(p => p.isGiftBox).length,
    avgPrice: products.reduce((sum, p) => sum + p.initialPrice, 0) / products.length
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-rose-50">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-amber-700 flex items-center gap-1">
            <Home size={16} />
            Accueil
          </Link>
          <ChevronRight size={16} />
          <span className="text-amber-800 font-medium">{categoryName}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {categoryName}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez notre sélection de {categoryName.toLowerCase()} Jeff De Bruges
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="bg-white rounded-xl px-6 py-3 shadow-sm">
              <p className="text-2xl font-bold text-amber-800">{stats.total}</p>
              <p className="text-sm text-gray-600">Produits</p>
            </div>
            {stats.premium > 0 && (
              <div className="bg-white rounded-xl px-6 py-3 shadow-sm">
                <p className="text-2xl font-bold text-amber-800">{stats.premium}</p>
                <p className="text-sm text-gray-600">Premium</p>
              </div>
            )}
            {stats.giftBox > 0 && (
              <div className="bg-white rounded-xl px-6 py-3 shadow-sm">
                <p className="text-2xl font-bold text-amber-800">{stats.giftBox}</p>
                <p className="text-sm text-gray-600">Boîtes Cadeau</p>
              </div>
            )}
            <div className="bg-white rounded-xl px-6 py-3 shadow-sm">
              <p className="text-2xl font-bold text-amber-800">{Math.round(stats.avgPrice)} MAD</p>
              <p className="text-sm text-gray-600">Prix moyen</p>
            </div>
          </div>
        </div>

        {/* Subcategories Filter */}
        {subCategories.length > 1 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href={`/categories/${encodeURIComponent(categoryName)}`}
                className="px-6 py-2 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
              >
                Tout voir ({products.length})
              </Link>
              {subCategories.map(subCat => {
                const count = products.filter(p => p.subCategory === subCat).length
                return (
                  <button
                    key={subCat}
                    onClick={() => {
                      // Filter products by scrolling to section
                      document.getElementById(`subcat-${subCat}`)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="px-6 py-2 rounded-full bg-white text-gray-700 font-semibold hover:bg-amber-100 transition-colors border-2 border-gray-200 hover:border-amber-300"
                  >
                    {subCat} ({count})
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Products Grid - Grouped by SubCategory */}
        {subCategories.length > 1 ? (
          <div className="space-y-12">
            {subCategories.map(subCat => {
              const subCatProducts = products.filter(p => p.subCategory === subCat)
              return (
                <div key={subCat} id={`subcat-${subCat}`}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-amber-200">
                    {subCat}
                    <span className="text-lg text-gray-500 ml-3">({subCatProducts.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {subCatProducts.map((product) => (
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
              )
            })}
          </div>
        ) : (
          // All products in single grid if no subcategories
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
        )}
      </div>
    </div>
  )
}
