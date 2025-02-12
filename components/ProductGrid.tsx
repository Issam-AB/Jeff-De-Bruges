'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import ProductCard from './ProductCard'
import { Product, MainCategory, SubCategoryType } from '@/lib/types'
import { motion } from 'framer-motion'

// Export the ValidCategory type
export type ValidCategory = 
  | "Salon en L" 
  | "Salon en U" 
  | "Canapé 2 Places" 
  | "Canapé 3 Places" 
  | "Fauteuils" 
  | "Lits" 
  | "Matelas" 
  | "Table de Chevet" 
  | "Armoires" 
  | "Bibliothèques" 
  | "Buffets" 
  | "SALONS"
  | "CHAMBRES"
  | "RANGEMENTS"
  | "TOUS"
  | undefined;

interface ProductGridProps {
  products: Product[]
  category?: ValidCategory
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
    
    if (!category) {
      console.log('No category - showing all products')
      setProducts(initialProducts)
    } else {
      console.log('Filtering by category:', category)
      const normalizedCategory = category
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        
      const filteredProducts = initialProducts.filter(product => {
        const normalizedMainCategory = product.mainCategory
          ?.normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
        const normalizedSubCategory = product.subCategory
          ?.normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase()
        
        return normalizedMainCategory === normalizedCategory || 
               normalizedSubCategory === normalizedCategory
      })
      
      console.log('Filtered products count:', filteredProducts.length)
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
    return (
      <div className="w-full mt-24 flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full flex items-center justify-center">
              <svg 
                className="w-10 h-10 text-orange-500"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M20 12H4M8 16l-4-4 4-4"
                />
              </svg>
            </div>
          </motion.div>

          {/* Main Message */}
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-semibold text-gray-800 mb-3"
          >
            {category 
              ? `Aucun produit dans ${category.toLowerCase()}`
              : 'Aucun produit disponible'
            }
          </motion.h3>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 mb-6"
          >
            Nous n'avons pas encore de produits dans cette catégorie
          </motion.p>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-400"
          >
            <p>Suggestions:</p>
            <ul className="mt-2 space-y-1">
              <li>• Essayez une autre catégorie</li>
              <li>• Revenez plus tard pour voir les nouveautés</li>
              <li>• Consultez notre collection complète</li>
            </ul>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.6 }}
            className="absolute -z-10 inset-0 overflow-hidden"
          >
            <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-orange-100 rounded-full opacity-10 blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-orange-200 rounded-full opacity-10 blur-3xl" />
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full mt-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div
          ref={ref}
          className="w-full h-20 flex items-center justify-center"
        >
          {isLoading && (
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}
    </div>
  )
}

