'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import ProductCard from './ProductCard'
import { Product, MainCategory, SubCategoryType } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCardSkeleton from './ProductCardSkeleton'
import EmptyState from './EmptyState'
import { Category } from '@/lib/categories'

interface ProductGridProps {
  products: Product[]
  category?: Category
}

export default function ProductGrid({ products: initialProducts, category }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { ref, inView } = useInView()

  useEffect(() => {
    console.log('Effect triggered with category:', category)
    console.log('Initial products count:', initialProducts.length)
    
    if (initialProducts.length === 0) {
      console.log('No initial products available')
      return
    }
    
    if (!category || category.slug.toLowerCase() === 'tous') {
      console.log('Setting all products')
      setProducts(initialProducts)
    } else {
      console.log('Filtering products for category:', category.name)
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
            url.searchParams.set('category', category)
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

  if (products.length === 0) {
    return <EmptyState category={category} />
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category} // This will trigger animation on category change
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full mt-24"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
          
          {/* Loading skeletons for infinite scroll */}
          {isLoading && (
            <>
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={`skeleton-${i}`} />
              ))}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

