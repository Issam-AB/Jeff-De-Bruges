'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'
import { Product } from '@/types'
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
  
  // Debug logging
  console.log('ProductGrid - Total products:', initialProducts.length)
  console.log('ProductGrid - Top products:', initialProducts.filter(p => p.isTopProduct))
  
  // Filter and sort regular products:
  // 1. Must be active
  // 2. Must NOT have "r-" prefix in ref
  // 3. Sort by isTopProduct first, then by createdAt date (most recent first)
  const regularProducts = initialProducts
    .filter(p => {
      const hasRPrefix = p.ref.toLowerCase().startsWith('r-')
      return p.isActive && !hasRPrefix
    })
    .sort((a, b) => {
      // First priority: Top products
      const aIsTop = a.isTopProduct ?? false
      const bIsTop = b.isTopProduct ?? false
      if (aIsTop && !bIsTop) return -1
      if (!aIsTop && bIsTop) return 1
      
      // If both are top products or both are not, sort by creation date
      const dateA = new Date(a.createdAt)
      const dateB = new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime() // Most recent first
    })

  // Debug logging for sorted products
  console.log('ProductGrid - First 5 regular products:', regularProducts.slice(0, 5).map(p => ({ name: p.name, isTopProduct: p.isTopProduct })))

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

