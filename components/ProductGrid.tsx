'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'
import { Product } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import EmptyState from './EmptyState'
import { Category } from '@/lib/categories'
import ArticleRougeSection from './ArticleRougeSection'
import QuickView from './QuickView'

interface ProductGridProps {
  products: Product[]
  category?: Category
}

export default function ProductGrid({ products: initialProducts, category }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Find Article Rouge products
  const articleRougeProducts = initialProducts.filter(p => p.isArticleRouge && p.isActive)
  const regularProducts = initialProducts.filter(p => !p.isArticleRouge)

  if (initialProducts.length === 0) {
    return <EmptyState category={category} />
  }

  return (
    <div>
      {/* Article Rouge Section */}
      {articleRougeProducts.length > 0 && (
        <div className="mb-6 md:mb-12">
          <ArticleRougeSection products={articleRougeProducts} />
        </div>
      )}

      {/* Regular Products Grid */}
      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {regularProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: [0.25, 0.25, 0, 1]
                }}
              >
                <ProductCard 
                  product={product}
                  onQuickView={() => setSelectedProduct(product)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* QuickView Modal */}
      {selectedProduct && (
        <QuickView 
          product={selectedProduct} 
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  )
}

