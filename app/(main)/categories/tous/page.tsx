import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'

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


  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        {/* Simple Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tous les Produits
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

