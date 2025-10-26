'use client'

import { Product } from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Tag, Ruler, Timer, MapPin, ChevronLeft, ChevronRight, Flame, Clock } from 'lucide-react'
import { WhatsappIcon } from 'react-share'
import { track } from '@vercel/analytics'
import useEmblaCarousel from 'embla-carousel-react'
import { useState, useEffect } from 'react'

interface ArticleRougePageProps {
  product: Product
}

export default function ArticleRougePage({ product }: ArticleRougePageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const images = [product.mainImage, ...product.gallery].filter(Boolean)
  
  const [mainViewRef, mainEmbla] = useEmblaCarousel({ 
    loop: true,
    align: 'center'
  })

  useEffect(() => {
    if (!mainEmbla) return

    const onSelect = () => {
      setCurrentImageIndex(mainEmbla.selectedScrollSnap())
    }

    mainEmbla.on('select', onSelect)
    return () => {
      mainEmbla.off('select', onSelect)
    }
  }, [mainEmbla])

  const handleWhatsAppOrder = () => {
    track('whatsapp_order_click', {
      productId: product.id,
      productName: product.name,
      productPrice: product.articleRougePrice || product.VenteflashPrice,
      category: product.mainCategory
    })

    const message = encodeURIComponent(
      `Bonjour, je suis intéressé par ce produit DERNIÈRE PIÈCE :

🔥 *${product.name}*
🏷️ Catégorie : ${product.mainCategory} - ${product.subCategory}
📏 Dimensions : ${product.dimensions}
💰 Prix : ${(product.articleRougePrice || product.VenteflashPrice).toLocaleString('fr-FR').replace(',', ' ')} DH
📍 Magasin : ${product.store || 'À confirmer'}

Réf: ${product.ref}`
    )
    window.open(`https://api.whatsapp.com/send?phone=212666013108&text=${message}`, '_blank')
  }

  const getCategoryUrl = () => {
    const categorySlug = product.mainCategory
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zà-ÿ0-9-]/g, '')
    
    return `/categories/${categorySlug}`
  }

  const discountPercentage = Math.round(
    (1 - (product.articleRougePrice || product.VenteflashPrice) / product.initialPrice) * 100
  )

  return (
    <div className="pt-16 lg:pt-[64px]">
      <div className="flex flex-col lg:flex-row">
        {/* Left: Image Gallery with Labels */}
        <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto lg:h-[calc(100vh-64px)] bg-white relative">
          {/* Dernière Pièce Label - Updated top spacing */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-6 left-4 z-10"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-red-600 px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ 
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.2, 1.2, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Flame className="w-4 h-4 text-yellow-300" />
                </motion.div>
                <span className="text-sm font-bold text-white tracking-wide">
                  DERNIÈRE PIÈCE
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Store Location - Bottom Left */}
          {product.store && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">
                    Disponible à {product.store}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}

          <div className="embla w-full h-full">
            <div className="embla__container h-full w-full flex" ref={mainViewRef}>
              {images.map((image, index) => (
                <div key={image} className="embla__slide relative w-full h-full flex-[0_0_100%]">
                  <Image
                    src={image}
                    alt={`${product.name} - Vue ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: 'center center'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="w-full lg:w-1/2 bg-white">
          <div className="p-6 space-y-8">
            {/* Title and Category */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 uppercase mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                {product.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Link 
                  href={getCategoryUrl()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 text-red-700 rounded-lg border border-red-200 hover:from-red-100 hover:to-red-200 transition-colors cursor-pointer"
                >
                  <Tag size={16} />
                  <span className="font-medium">{product.subCategory}</span>
                </Link>
                <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg border border-gray-200">
                  <Ruler size={16} />
                  <span className="font-medium">{product.dimensions}</span>
                </div>
              </div>
            </div>

            {/* Price Section - Updated with red, yellow, white */}
            <div className="relative">
              <div className="bg-red-600 p-6 rounded-xl shadow-lg">
                <div className="space-y-4">
                  {/* Original price and discount */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white/80 line-through text-lg">
                        {product.initialPrice.toLocaleString('fr-FR')} DH
                      </span>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="bg-yellow-400 px-3 py-1 rounded-full"
                      >
                        <span className="text-red-600 font-bold">-{discountPercentage}%</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Main price */}
                  <div className="relative">
                    <motion.div
                      className="flex items-baseline gap-2"
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-6xl font-black text-yellow-400">
                        {(product.articleRougePrice || product.VenteflashPrice).toLocaleString('fr-FR')}
                      </span>
                      <span className="text-2xl font-bold text-white">DH</span>
                    </motion.div>
                  </div>

                  {/* Price label */}
                  <div className="pt-2">
                    <motion.div
                      className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Timer className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white">
                        Prix exceptionnel - Offre limitée
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Marketing Features */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100 shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-900">Offre Flash</p>
                    <p className="text-sm text-amber-700">Prix limité dans le temps</p>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border border-red-100 shadow-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Flame className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-red-900">Stock Unique</p>
                    <p className="text-sm text-red-700">Dernière pièce</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Enhanced WhatsApp Button */}
            <motion.button
              onClick={handleWhatsAppOrder}
              className="w-full bg-gradient-to-r from-[#25D366] to-[#1FA855] text-white rounded-xl py-5 px-6 flex items-center justify-center gap-4 shadow-lg shadow-[#23D366]/20"
              whileHover={{ scale: 1.02, backgroundPosition: '100%' }}
              whileTap={{ scale: 0.98 }}
              style={{ backgroundSize: '200% 100%' }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                <WhatsappIcon 
                  size={40} 
                  round={false}
                  bgStyle={{ fill: "transparent" }}
                  iconFillColor="white"
                />
              </div>
              <div className="text-left">
                <span className="block text-xl font-bold">
                  Commander maintenant
                </span>
                <span className="block text-sm font-medium text-white/90">
                  Avant qu'il ne soit trop tard
                </span>
              </div>
            </motion.button>

            {/* Urgency Counter */}
            <motion.div 
              className="bg-gradient-to-br from-red-600 to-red-500 text-white p-4 rounded-lg shadow-lg"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center justify-center gap-2 text-center">
                <Timer className="w-5 h-5" />
                <p className="font-medium">
                  Plus de 50 personnes ont vu ce produit aujourd'hui
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 