'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import ProductCard from './ProductCard'
import { Product } from '@/lib/types'
import { motion } from 'framer-motion'
import ProductCardSkeleton from './ProductCardSkeleton'
import EmptyState from './EmptyState'
import { Category } from '@/lib/categories'
import ArticleRougeSection from './ArticleRougeSection'
import QuickView from './QuickView'

interface ProductGridProps {
  products: Product[]
  category?: Category
}

export default function ProductGrid({ products: initialProducts, category }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { ref, inView } = useInView()

  useEffect(() => {
    if (initialProducts.length === 0) {
      return
    }
    
    if (!category || category.slug.toLowerCase() === 'tous') {
      setProducts(initialProducts)
    } else {
      const filteredProducts = initialProducts.filter(product => 
        product.mainCategory?.toLowerCase() === category.name.toLowerCase() ||
        product.subCategory?.toLowerCase() === category.name.toLowerCase()
      )
      setProducts(filteredProducts)
    }
    
    setPage(1)
    setHasMore(true)
    setIsLoading(false)
  }, [initialProducts, category])

  // Load more products when scrolling
  useEffect(() => {
    const loadMoreProducts = async () => {
      if (!isLoading && hasMore && inView) {
        setIsLoading(true)
        try {
          const skip = products.length
          const take = 12
          
          const url = new URL('/api/products', window.location.origin)
          url.searchParams.set('skip', skip.toString())
          url.searchParams.set('take', take.toString())
          if (category) {
            url.searchParams.set('category', category.slug)
          }
          
          const response = await fetch(url.toString())
          const newProducts = await response.json()

          if (!Array.isArray(newProducts) || newProducts.length === 0) {
            setHasMore(false)
            return
          }

          const existingIds = new Set(products.map(p => p.id))
          const uniqueNewProducts = newProducts.filter(p => !existingIds.has(p.id))

          if (uniqueNewProducts.length === 0) {
            setHasMore(false)
            return
          }

          setProducts(prev => [...prev, ...uniqueNewProducts])
          setPage(prev => prev + 1)
          setHasMore(newProducts.length === take)
        } catch (error) {
          console.error('Error loading more products:', error)
          setHasMore(false)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadMoreProducts()
  }, [inView, hasMore, isLoading, category, products.length])

  // Debug logging
  useEffect(() => {
    console.log('ProductGrid received products:', initialProducts)
    console.log('Article Rouge check:', initialProducts.map(p => ({
      ref: p.ref,
      isArticleRouge: p.isArticleRouge,
      isActive: p.isActive
    })))
  }, [initialProducts])

  // Find Article Rouge products first
  const articleRougeProducts = initialProducts.filter(p => p.isArticleRouge && p.isActive)
  const regularProducts = initialProducts.filter(p => !p.isArticleRouge)

  // If no products at all, show empty state
  if (products.length === 0) {
    return <EmptyState category={category} />
  }

  return (
    <div>
      {/* Article Rouge Section - Adjusted spacing */}
      {articleRougeProducts.length > 0 && (
        <div className="mb-6 md:mb-12">
          <ArticleRougeSection products={articleRougeProducts} />
        </div>
      )}

      {/* Regular Products Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {regularProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            onQuickView={() => setSelectedProduct(product)}
          />
        ))}
      </motion.div>

      {selectedProduct && (
        <QuickView 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  )
}

