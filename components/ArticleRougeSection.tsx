'use client'

import { Product } from '@/lib/types'
import { motion } from 'framer-motion'
import { Flame, MapPin, Timer, Tag, Ruler, Phone } from 'lucide-react'
import Image from 'next/image'
import { useRef } from 'react'
import { WhatsappIcon } from 'react-share'
import { track } from '@vercel/analytics'

interface ArticleRougeSectionProps {
  products: Product[]
}

const SKETCH_LOGO = 'https://zruplcd5sfldkzdm.public.blob.vercel-storage.com/SketchDesign.svg'

export default function ArticleRougeSection({ products }: ArticleRougeSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!products.length) return null

  const handleWhatsAppClick = (product: Product) => {
    // Track the WhatsApp button click
    track('whatsapp_article_rouge_click', {
      productId: product.id,
      productName: product.name,
      productPrice: product.articleRougePrice || product.VenteflashPrice,
      store: product.store || 'Non spécifié'
    })

    // Format price with thousand separator
    const formattedPrice = product.articleRougePrice?.toLocaleString('fr-FR') || 
                          product.VenteflashPrice.toLocaleString('fr-FR')

    // Create message with fallback for store
    const message = encodeURIComponent(
      `Bonjour, je suis intéressé par l'Article Rouge: ${product.name} (${product.ref}) à ${formattedPrice} DH${
        product.store ? ` disponible au magasin de ${product.store}` : ''
      }.`
    )
    
    const apiUrl = `https://api.whatsapp.com/send?phone=212666013108&text=${message}`
    window.open(apiUrl, '_blank')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden md:rounded-lg -mx-8 md:mx-0 mt-2 md:mt-8 shadow-lg"
    >
      {/* Simplified Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500" />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Flame className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-white">Articles presque épuisés</h2>
            <p className="text-sm text-white/80">Offres exceptionnelles à ne pas manquer</p>
          </div>
        </div>

        {/* Horizontal Scroll of Products */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        >
          {products.map(product => (
            <motion.div 
              key={product.id}
              className="flex-none w-[280px]"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div 
                className="relative bg-white overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-shadow duration-300 cursor-pointer"
                onClick={() => handleWhatsAppClick(product)}
              >
                {/* Main Image Container */}
                <div className="relative aspect-square">
                  <Image
                    src={product.mainImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Store Badge */}
                  {product.store && (
                    <div className="absolute top-3 left-3 z-10">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-lg"
                      >
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        <span className="text-xs font-bold text-red-600">{product.store}</span>
                      </motion.div>
                    </div>
                  )}

                  {/* Last Piece Badge */}
                  <motion.div 
                    className="absolute top-3 right-3 z-10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="flex items-center gap-1.5 bg-red-600 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-lg border border-red-400">
                      <Timer className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs font-bold text-white">DERNIÈRE PIÈCE</span>
                    </div>
                  </motion.div>

                  {/* WhatsApp Button */}
                  <motion.div
                    className="absolute bottom-3 left-3 z-20"
                    whileHover={{ scale: 1.05 }}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="flex items-center gap-2 bg-[#25D366] px-3 py-2 rounded-full shadow-lg">
                      <WhatsappIcon 
                        size={20} 
                        round={false}
                        bgStyle={{ fill: "transparent" }}
                        iconFillColor="white"
                      />
                      <span className="text-xs font-bold text-white">Commander</span>
                    </div>
                  </motion.div>

                  {/* Price Tag */}
                  <div className="absolute -bottom-3 -right-3 z-20">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: -3 }}
                      className="bg-yellow-400 px-4 py-2 rounded-lg shadow-lg transform -rotate-6"
                    >
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
                    </motion.div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900">
                    {product.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700">
                      <Tag className="w-3 h-3" />
                      {product.subCategory}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700">
                      <Ruler className="w-3 h-3" />
                      {product.dimensions}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Add this to your global CSS or tailwind.config.js
const shimmerAnimation = {
  '@keyframes shimmer': {
    '0%': {
      transform: 'translateX(-150%) translateY(150%) rotate(-45deg)',
    },
    '100%': {
      transform: 'translateX(150%) translateY(-150%) rotate(-45deg)',
    },
  },
} 