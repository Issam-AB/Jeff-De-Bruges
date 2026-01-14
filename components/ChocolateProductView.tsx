'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Product } from '@/types'
import { WhatsappIcon } from 'react-share'
import { normalizeImagePath } from '@/lib/image-utils'
import { 
  Package, 
  Tag, 
  Ruler, 
  ShoppingBag, 
  Clock, 
  Heart,
  Share2,
  Scale,
  Award,
  Gift,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Home
} from 'lucide-react'
import { track } from '@vercel/analytics'
import useEmblaCarousel from 'embla-carousel-react'

interface ChocolateProductViewProps {
  product: Product
}

export default function ChocolateProductView({ product }: ChocolateProductViewProps) {
  const images = [product.mainImage, ...product.gallery].filter(Boolean)
  const [mainViewRef, mainEmbla] = useEmblaCarousel({ loop: false, align: 'center' })
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  useEffect(() => {
    if (!mainEmbla) return
    const onSelect = () => setCurrentImageIndex(mainEmbla.selectedScrollSnap())
    mainEmbla.on('select', onSelect)
    return () => {
      mainEmbla?.off('select', onSelect)
    }
  }, [mainEmbla])

  const handleWhatsAppOrder = () => {
    track('whatsapp_order_click', {
      productId: product.id,
      productName: product.name,
      productPrice: product.VenteflashPrice || product.initialPrice,
      category: product.mainCategory
    })

    const message = encodeURIComponent(
      `Bonjour, je suis intéressé par ce produit Jeff De Bruges :

🍫 *${product.name}*
🏷️ Catégorie : ${product.mainCategory} ${product.subCategory ? `- ${product.subCategory}` : ''}
📏 Dimensions : ${product.dimensions}
💰 Prix : ${product.VenteflashPrice || product.initialPrice} MAD
📦 Quantité : ${selectedQuantity}
${product.sku ? `🔖 SKU : ${product.sku}` : ''}

Merci !`
    )

    window.open(`https://wa.me/212645666000?text=${message}`, '_blank')
  }

  const displayPrice = product.VenteflashPrice || product.initialPrice

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-rose-50">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-amber-700 flex items-center gap-1">
            <Home size={16} />
            Accueil
          </Link>
          <ChevronRight size={16} />
          <Link 
            href={`/categories/${product.mainCategory.toLowerCase()}`}
            className="hover:text-amber-700"
          >
            {product.mainCategory}
          </Link>
          {product.subCategory && (
            <>
              <ChevronRight size={16} />
              <span className="text-amber-800 font-medium">{product.subCategory}</span>
            </>
          )}
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images Gallery */}
          <div className="space-y-4">
            {/* Main Image Carousel */}
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-hidden" ref={mainViewRef}>
                <div className="flex">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex-[0_0_100%] min-w-0 relative aspect-square">
                      <Image
                        src={normalizeImagePath(img)}
                        alt={`${product.name} - Image ${idx + 1}`}
                        fill
                        className="object-cover"
                        priority={idx === 0}
                        unoptimized={true}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => mainEmbla?.scrollPrev()}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-6 h-6 text-amber-800" />
                  </button>
                  <button
                    onClick={() => mainEmbla?.scrollNext()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-6 h-6 text-amber-800" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {product.isGiftBox && (
                  <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Gift size={14} />
                    Coffret Cadeau
                  </span>
                )}
                {product.isPremium && (
                  <span className="bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Award size={14} />
                    Premium
                  </span>
                )}
                {product.isArticleRouge && (
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                    🔥 Article Rouge
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => mainEmbla?.scrollTo(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-amber-600 ring-2 ring-amber-300'
                        : 'border-gray-200 hover:border-amber-400'
                    }`}
                  >
                    <Image
                      src={normalizeImagePath(img)}
                      alt={`Miniature ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & REF */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-sm text-gray-500">
                REF: <span className="font-mono font-semibold">{product.ref}</span>
                {product.sku && (
                  <span className="ml-4">SKU: <span className="font-mono font-semibold">{product.sku}</span></span>
                )}
              </p>
            </div>

            {/* Price */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-amber-800">
                  {displayPrice.toFixed(2)}
                </span>
                <span className="text-2xl text-amber-700 font-semibold">MAD</span>
              </div>
              {product.initialPrice !== displayPrice && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg text-gray-500 line-through">
                    {product.initialPrice.toFixed(2)} MAD
                  </span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                    -{Math.round((1 - displayPrice / product.initialPrice) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Product Details Grid */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="text-amber-600" size={24} />
                Détails du Produit
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div className="flex items-start gap-3">
                  <Tag className="text-amber-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Catégorie</p>
                    <Link 
                      href={`/categories/${product.mainCategory.toLowerCase()}`}
                      className="font-semibold text-amber-800 hover:underline"
                    >
                      {product.mainCategory}
                    </Link>
                  </div>
                </div>

                {/* SubCategory */}
                {product.subCategory && (
                  <div className="flex items-start gap-3">
                    <Tag className="text-amber-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-semibold text-gray-800">{product.subCategory}</p>
                    </div>
                  </div>
                )}

                {/* Dimensions */}
                <div className="flex items-start gap-3">
                  <Ruler className="text-amber-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Dimensions</p>
                    <p className="font-semibold text-gray-800">{product.dimensions}</p>
                  </div>
                </div>

                {/* Weight */}
                {product.weight && (
                  <div className="flex items-start gap-3">
                    <Scale className="text-amber-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Poids</p>
                      <p className="font-semibold text-gray-800">
                        {product.weight}{product.weightUnit || 'g'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Quantity */}
                {product.quantity && (
                  <div className="flex items-start gap-3">
                    <Package className="text-amber-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Nombre de pièces</p>
                      <p className="font-semibold text-gray-800">{product.quantity} chocolats</p>
                    </div>
                  </div>
                )}

                {/* Chocolate Type */}
                {product.chocolateType && (
                  <div className="flex items-start gap-3">
                    <Package className="text-amber-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Type de chocolat</p>
                      <p className="font-semibold text-gray-800 capitalize">{product.chocolateType}</p>
                    </div>
                  </div>
                )}

                {/* Brand */}
                {product.brand && (
                  <div className="flex items-start gap-3">
                    <Award className="text-amber-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Collection</p>
                      <p className="font-semibold text-gray-800">{product.brand}</p>
                    </div>
                  </div>
                )}

                {/* Material */}
                {product.material && (
                  <div className="flex items-start gap-3">
                    <Package className="text-amber-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Matériau</p>
                      <p className="font-semibold text-gray-800">{product.material}</p>
                    </div>
                  </div>
                )}

                {/* Shape */}
                {product.shape && (
                  <div className="flex items-start gap-3">
                    <Package className="text-amber-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Forme</p>
                      <p className="font-semibold text-gray-800">{product.shape}</p>
                    </div>
                  </div>
                )}

                {/* Expiration */}
                {product.expirationDays && (
                  <div className="flex items-start gap-3">
                    <Clock className="text-amber-600 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Conservation</p>
                      <p className="font-semibold text-gray-800">{product.expirationDays} jours</p>
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                <div className="flex items-start gap-3">
                  <ShoppingBag className="text-amber-600 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Disponibilité</p>
                    <p className={`font-semibold ${(product.stock || 0) > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {(product.stock || 0) > 0 ? 'En stock' : 'Sur commande'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Allergens */}
              {product.allergens && product.allergens.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    Allergènes:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.allergens.map((allergen, idx) => (
                      <span
                        key={idx}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quantité
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">
                  {selectedQuantity}
                </span>
                <button
                  onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* WhatsApp Order Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleWhatsAppOrder}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg transition-all"
            >
              <WhatsappIcon size={32} round />
              <span className="text-lg">Commander sur WhatsApp</span>
            </motion.button>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <ShoppingBag className="mx-auto text-amber-600 mb-2" size={24} />
                <p className="text-xs font-semibold text-gray-700">Livraison Rapide</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Heart className="mx-auto text-red-500 mb-2" size={24} />
                <p className="text-xs font-semibold text-gray-700">Qualité Premium</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

