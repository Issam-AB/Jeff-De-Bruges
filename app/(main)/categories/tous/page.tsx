import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { Home } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tous les Produits - Jeff De Bruges',
  description: 'Découvrez tous nos produits de chocolats et boîtes cadeaux Jeff De Bruges',
}

export default async function AllProductsPage() {
  // Get all active products
  const products = await prisma.product.findMany({
    where: {
      isActive: true
    },
    orderBy: [
      { isPremium: 'desc' },
      { isGiftBox: 'desc' },
      { isTopProduct: 'desc' },
      { initialPrice: 'desc' }
    ]
  })

  // Get all categories
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  // Get stats
  const stats = {
    total: products.length,
    premium: products.filter(p => p.isPremium).length,
    giftBox: products.filter(p => p.isGiftBox).length,
    avgPrice: products.reduce((sum, p) => sum + p.initialPrice, 0) / products.length
  }

  // Group by category
  const productsByCategory = categories.map(cat => ({
    category: cat.name,
    products: products.filter(p => p.mainCategory === cat.name)
  })).filter(group => group.products.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-rose-50">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-amber-700 flex items-center gap-1">
            <Home size={16} />
            Accueil
          </Link>
          <span className="text-amber-800 font-medium">Tous les produits</span>
        </nav>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tous les Produits
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez toute notre collection de chocolats et boîtes cadeaux Jeff De Bruges
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

        {/* Category Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/categories/tous"
              className="px-6 py-2 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
            >
              Tous ({products.length})
            </Link>
            {productsByCategory.map(({ category, products: catProducts }) => (
              <Link
                key={category}
                href={`/categories/${encodeURIComponent(category)}`}
                className="px-6 py-2 rounded-full bg-white text-gray-700 font-semibold hover:bg-amber-100 transition-colors border-2 border-gray-200 hover:border-amber-300"
              >
                {category} ({catProducts.length})
              </Link>
            ))}
          </div>
        </div>

        {/* Products by Category */}
        <div className="space-y-12">
          {productsByCategory.map(({ category, products: catProducts }) => (
            <div key={category} id={`cat-${category}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 pb-2 border-b-2 border-amber-200">
                  {category}
                  <span className="text-lg text-gray-500 ml-3">({catProducts.length})</span>
                </h2>
                <Link
                  href={`/categories/${encodeURIComponent(category)}`}
                  className="text-amber-600 hover:text-amber-700 font-semibold text-sm"
                >
                  Voir tout →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {catProducts.slice(0, 8).map((product) => (
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
              {catProducts.length > 8 && (
                <div className="text-center mt-6">
                  <Link
                    href={`/categories/${encodeURIComponent(category)}`}
                    className="inline-block px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Voir tous les {catProducts.length} produits →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

