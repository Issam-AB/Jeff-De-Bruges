'use client'

import { Product } from '@/types'
import { motion } from 'framer-motion'
import { Flame, MapPin, Timer, Tag, Ruler, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useRef, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getArticleRougeProducts } from '@/lib/articleRougeApi'

interface ArticleRougeSectionProps {
  products: Product[]
}

// Updated store colors with more solid choices
const STORE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Marrakech': { bg: 'bg-red-500', border: 'border-red-600', text: 'text-red-50' },
  'Tanger': { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-blue-50' },
  'Casablanca': { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-emerald-50' },
  'Rabat': { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-purple-50' },
  'Fès': { bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-amber-50' },
  'Agadir': { bg: 'bg-pink-500', border: 'border-pink-600', text: 'text-pink-50' },
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default function ArticleRougeSection({ products }: ArticleRougeSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const router = useRouter()
  
  // Update the stores useMemo to ensure non-null values
  const { stores } = useMemo(() => {
    const storeSet = new Set(products.map(p => p.store).filter((store): store is string => !!store))
    return {
      stores: Array.from(storeSet)
    }
  }, [products])

  // Filter products based on selected store without shuffling
  const filteredProducts = useMemo(() => {
    if (!selectedStore) return products
    return products.filter(p => p.store === selectedStore)
  }, [products, selectedStore])

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 340 // Width of card + gap
    const scrollLeft = scrollRef.current.scrollLeft
    const newScrollLeft = direction === 'left' 
      ? scrollLeft - scrollAmount 
      : scrollLeft + scrollAmount
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    })
  }

  // Replace handleProductClick with getProductUrl
  const getProductUrl = (product: Product) => {
    const productSlug = generateSlug(product.name)
    return `/articlesrouges/${productSlug}`
  }

  if (!products.length) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden md:rounded-lg -mx-[16px] md:mx-0 mt-2 md:mt-8 shadow-lg"
    >
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 animate-gradient" />

      <div className="relative p-2 md:p-4">
        {/* Header with Counter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              <Flame className="w-8 h-8 text-white" />
              <motion.div
                className="absolute inset-0 w-8 h-8 text-white"
                animate={{ 
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame className="w-8 h-8" />
              </motion.div>
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Articles presque épuisés
                <motion.span 
                  className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {filteredProducts.length}
                </motion.span>
              </h2>
              <p className="text-sm text-white/80">Offres exceptionnelles à ne pas manquer</p>
            </div>
          </div>

          {/* Store Filter */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setSelectedStore(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${!selectedStore 
                  ? 'bg-white text-red-600 shadow-lg' 
                  : 'bg-white/20 text-white hover:bg-white/30'
                }`}
            >
              Tous
            </button>
            {stores.map(store => (
              <button
                key={store}
                onClick={() => setSelectedStore(store)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedStore === store 
                    ? `${STORE_COLORS[store]?.bg} ${STORE_COLORS[store]?.text} shadow-lg` 
                    : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                {store}
              </button>
            ))}
          </div>
        </div>

        {/* Products Scroll Container */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex gap-2 md:gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          >
            {filteredProducts.map((product) => (
              <motion.div 
                key={product.id}
                className="flex-none w-[300px] md:w-[320px]"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Link 
                  href={getProductUrl(product)}
                  className="relative bg-white overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-shadow duration-300 cursor-pointer h-full flex flex-col block touch-manipulation"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {/* Main Image Container */}
                  <div className="relative aspect-square">
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Store Badge with solid colors */}
                    {product.store && (
                      <div className="absolute top-3 left-3 z-10 pointer-events-none">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg border
                            ${STORE_COLORS[product.store]?.bg}
                            ${STORE_COLORS[product.store]?.border}
                            ${STORE_COLORS[product.store]?.text}
                          `}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{product.store}</span>
                        </motion.div>
                      </div>
                    )}

                    {/* Last Piece Badge */}
                    <motion.div 
                      className="absolute top-3 right-3 z-10 pointer-events-none"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="flex items-center gap-1.5 bg-red-600 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-lg border border-red-400">
                        <Timer className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-bold text-white">DERNIÈRE PIÈCE</span>
                      </div>
                    </motion.div>

                    {/* Price Tag - Updated with permanent skew */}
                    <div className="absolute -bottom-3 -right-3 z-20 pointer-events-none">
                      <div className="bg-yellow-400 px-4 py-2 rounded-lg shadow-lg transform -rotate-6">
                        <div className="text-center">
                          <span className="text-2xl font-black text-black">
                            {(product.articleRougePrice || product.VenteflashPrice)?.toLocaleString('fr-FR')} DH
                          </span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs text-black/60 line-through">
                              {product.initialPrice.toLocaleString('fr-FR')} DH
                            </span>
                            <span className="text-xs font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">
                              -{Math.round((1 - (product.articleRougePrice || 0) / product.initialPrice) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Info - Updated labels with gradients */}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg mb-4 line-clamp-2 text-gray-900 flex-grow uppercase">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-3 mt-auto">
                      {/* Category label - more subtle gradient */}
                      <span className="flex-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 border border-gray-200">
                        <Tag className="w-3 h-3 text-gray-500" />
                        {product.subCategory}
                      </span>
                      
                      {/* Dimensions label - more prominent gradient */}
                      <motion.span 
                        className="flex-1 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md border border-blue-600"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Ruler className="w-3 h-3" />
                        {product.dimensions}
                      </motion.span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Scroll Buttons */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg z-10 hidden md:block"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg z-10 hidden md:block"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Add to your global CSS or tailwind.config.js
const animations = {
  '.animate-gradient': {
    backgroundSize: '200% 200%',
    animation: 'gradient 8s ease infinite',
  },
  '@keyframes gradient': {
    '0%, 100%': {
      backgroundPosition: '0% 50%',
    },
    '50%': {
      backgroundPosition: '100% 50%',
    },
  },
}

export async function getServerSideProps() {
  const products = await getArticleRougeProducts()
  
  return {
    props: {
      products
    }
  }
} 