'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Product } from '@/lib/types'
import { WhatsappIcon } from 'react-share'
import { fetchStoreAvailability } from '@/lib/api'
import { 
  MapPin, 
  Tag, 
  Ruler, 
  ShoppingBag, 
  Eye, 
  Clock, 
  Flame as Fire, 
  X, 
  Truck, 
  Check, 
  Shield, 
  Star, 
  Timer, 
  Headphones, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from 'lucide-react'
import { track } from '@vercel/analytics'
import useEmblaCarousel from 'embla-carousel-react'
import useSWR from 'swr'
import { useRouter } from 'next/navigation'

interface QuickViewProps {
  product: Product
  isOpen?: boolean
  onClose?: () => void
  fullPage?: boolean
}

interface SheetProduct {
  ref: string;
  description: string;
}

const WATERMARK_URL = 'https://zruplcd5sfldkzdm.public.blob.vercel-storage.com/SketchDesign.svg'

const cityIcons: { [key: string]: JSX.Element } = {
  Casa: <MapPin size={14} />,
  Rabat: <MapPin size={14} />,
  Marrakech: <MapPin size={14} />,
  Tanger: <MapPin size={14} />,
}

const fetchSheetData = async (): Promise<SheetProduct[]> => {
  const sheetId = '175D2BWH65YrBN-jHopM77s4-PhWKHPVRQvRKhuJ0D4I'
  const response = await fetch(
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`
  )
  const text = await response.text()
  const json = JSON.parse(text.substring(47).slice(0, -2))
  
  return json.table.rows.map((row: any) => ({
    ref: row.c[0]?.v?.toString() || '',
    description: row.c[2]?.v?.toString() || ''
  }))
}

export default function QuickView({ product, isOpen = false, onClose = () => {}, fullPage = false }: QuickViewProps) {
  const [availability, setAvailability] = useState<{
    'Stock Casa': number;
    'Stock Rabat': number;
    'Stock Marrakech': number;
    'Stock Tanger': number;
  } | null>(null)
  const [viewersCount, setViewersCount] = useState(25) // Start with a fixed number
  const [isClient, setIsClient] = useState(false) // Add this to track hydration
  const images = [product.mainImage, ...product.gallery].filter(Boolean)
  const [mainViewRef, mainEmbla] = useEmblaCarousel({ 
    loop: false,
    align: 'center',
    containScroll: false
  })
  const [mobileViewRef, mobileEmbla] = useEmblaCarousel({ 
    loop: false,
    align: 'center',
    containScroll: false
  })
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const { data: sheetProducts } = useSWR<SheetProduct[]>('sheet-products', fetchSheetData)
  
  const productDescription = useMemo(() => {
    if (!sheetProducts) return ''
    const match = sheetProducts.find(p => p.ref === product.ref)
    return match?.description || 'Description non disponible'
  }, [sheetProducts, product.ref])

  const router = useRouter()

  useEffect(() => {
    // Mark component as hydrated
    setIsClient(true)
    
    // Set initial random value after hydration
    setViewersCount(Math.floor(Math.random() * 15) + 18)

    // Simulate changing viewers count
    const viewersInterval = setInterval(() => {
      setViewersCount(prev => {
        const change = Math.floor(Math.random() * 3) - 1
        const newCount = prev + change
        return newCount < 18 ? 18 : newCount > 33 ? 33 : newCount
      })
    }, 3000)

    return () => {
      clearInterval(viewersInterval)
    }
  }, []) // Only run once on mount

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const data = await fetchStoreAvailability(product.ref)
        setAvailability(data)
      } catch (err) {
        console.error(err)
      }
    }

    fetchAvailability()

    // Simulate changing viewers count
    const viewersInterval = setInterval(() => {
      setViewersCount(prev => {
        const change = Math.floor(Math.random() * 3) - 1
        const newCount = prev + change
        return newCount < 18 ? 18 : newCount > 33 ? 33 : newCount
      })
    }, 3000)

    return () => {
      clearInterval(viewersInterval)
    }
  }, [product.ref])

  useEffect(() => {
    if (!mainEmbla && !mobileEmbla) return;

    const onMainSelect = () => {
      if (mainEmbla) {
        setCurrentImageIndex(mainEmbla.selectedScrollSnap());
      }
    };

    const onMobileSelect = () => {
      if (mobileEmbla) {
        setCurrentImageIndex(mobileEmbla.selectedScrollSnap());
      }
    };

    mainEmbla?.on('select', onMainSelect);
    mobileEmbla?.on('select', onMobileSelect);
    
    // Force reinitialization with specific options
    mainEmbla?.reInit({
      loop: false,
      align: 'center',
      containScroll: false,
      dragFree: false
    });

    mobileEmbla?.reInit({
      loop: false,
      align: 'center',
      containScroll: false,
      dragFree: false
    });

    return () => {
      mainEmbla?.off('select', onMainSelect);
      mobileEmbla?.off('select', onMobileSelect);
    };
  }, [mainEmbla, mobileEmbla]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mainEmbla) return;
      
      if (e.key === 'ArrowLeft') {
        mainEmbla.scrollPrev();
      } else if (e.key === 'ArrowRight') {
        mainEmbla.scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mainEmbla]);

  const handleWhatsAppOrder = () => {
    // Track the WhatsApp button click
    track('whatsapp_order_click', {
      productId: product.id,
      productName: product.name,
      productPrice: product.VenteflashPrice,
      category: product.mainCategory
    });

    const message = encodeURIComponent(`Bonjour, je suis intéressé par l'achat de ${product.name} (${product.id}) pour ${product.VenteflashPrice.toLocaleString('fr-FR').replace(',', ' ')} DH.`)
    const apiUrl = `https://api.whatsapp.com/send?phone=212666013108&text=${message}`
    window.open(apiUrl, '_blank')
  }

  const storeOrder = ['Casa', 'Rabat', 'Marrakech', 'Tanger']

  const discountPercentage = Math.round((1 - product.VenteflashPrice / product.initialPrice) * 100)

  const handlePrevClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mainEmbla?.scrollPrev();
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mainEmbla?.scrollNext();
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const categorySlug = product.mainCategory
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zà-ÿ0-9-]/g, '')
    
    router.push(`/categories/${categorySlug}`)
    if (onClose) onClose()
  }

  interface StockStatus {
    color: string;
    text: string;
    icon: JSX.Element;
    bg: string;
    border: string;
    iconBg: string;
    badge: string;
  }

  const getStockStatus = (stock: number): StockStatus => {
    if (stock > 2) return { 
      color: 'green',
      text: 'En stock',
      icon: <Check size={15} />,
      bg: 'bg-green-50',
      border: 'border-green-100',
      iconBg: 'bg-green-100',
      badge: 'bg-green-100 text-green-700'
    }
    if (stock === 0) return { 
      color: 'gray',
      text: 'Épuisé',
      icon: <X size={15} />,
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      iconBg: 'bg-gray-100',
      badge: 'bg-gray-100 text-gray-600'
    }
    return { 
      color: 'amber',
      text: `${stock} restant${stock > 1 ? 's' : ''}`,
      icon: <Timer size={15} />,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      iconBg: 'bg-amber-100',
      badge: 'bg-amber-100 text-amber-700'
    }
  }

  const renderStoreAvailability = (store: string) => {
    const stockKey = `Stock ${store}` as keyof typeof availability;
    const stock = availability?.[stockKey] ?? 0;
    const status = getStockStatus(stock);

    return (
      <motion.div 
        key={store}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: storeOrder.indexOf(store) * 0.1 }}
        className={`
          relative group ${status.bg} rounded-xl p-4 border ${status.border}
          hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300
        `}
      >
        <div className="flex items-start gap-3">
          <div className={`
            relative p-2.5 rounded-lg bg-white shadow-sm
            ${stock > 0 ? 'ring-2 ring-gray-100' : ''}
          `}>
            <motion.div
              animate={stock > 0 ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {cityIcons[store]}
            </motion.div>
            {stock > 0 && (
              <motion.div
                className="absolute -right-1 -top-1 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900">
                {store}
              </p>
              <motion.div 
                className={`px-2 py-1 rounded-md text-xs font-medium ${status.badge}`}
                initial={false}
                animate={stock > 0 ? { 
                  y: [0, -2, 0],
                  scale: [1, 1.02, 1]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {status.text}
              </motion.div>
            </div>

            <div className={`flex items-center gap-1.5 text-${status.color}-600`}>
              <div className={`p-1 rounded-md ${status.iconBg}`}>
                {status.icon}
              </div>
              <p className="text-xs">
                {stock > 2 
                  ? 'Disponible maintenant'
                  : stock === 0
                    ? 'Temporairement indisponible'
                    : 'Quantité limitée'
                }
              </p>
            </div>
          </div>
        </div>

        <motion.div 
          initial={false}
          animate={stock > 0 ? { opacity: 1 } : { opacity: 0 }}
          className={`
            absolute inset-0 border-2 border-${status.color}-200/50 rounded-xl
            opacity-0 group-hover:opacity-100 transition-all duration-300
          `}
        />
      </motion.div>
    );
  };

  const DesktopImageGallery = (
    <div className={`embla h-full overflow-hidden ${fullPage ? 'absolute inset-0' : 'relative'}`} ref={mainViewRef}>
      <div className="embla__container h-full flex">
        {images.map((image, index) => (
          <div 
            key={image} 
            className="embla__slide relative w-full h-full flex-[0_0_100%]"
          >
            <Image
              src={image}
              alt={`${product.name} - Vue ${index + 1}`}
              fill
              className={`select-none ${
                index === 0 
                  ? "object-cover"
                  : "object-contain"
              }`}
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority={index === 0}
              draggable={false}
              quality={100}
            />
            {/* Watermark */}
            <div className={`absolute bottom-[52px] left-1/2 -translate-x-1/2 w-20 h-20 opacity-75 mix-blend-overlay ${fullPage ? 'hidden' : ''}`}>
              <Image
                src={WATERMARK_URL}
                alt="Sketch Design"
                fill
                className="object-contain brightness-0 invert"
                sizes="80px"
              />
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-none">
                <span className="text-white text-sm font-medium">
                  {currentImageIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-4 pointer-events-none">
          <button
            onClick={handlePrevClick}
            className="p-2 bg-white/90 shadow-lg hover:bg-white transition-all duration-200 group z-10 pointer-events-auto rounded-none"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800 group-hover:text-gray-600" />
          </button>
          <button
            onClick={handleNextClick}
            className="p-2 bg-white/90 shadow-lg hover:bg-white transition-all duration-200 group z-10 pointer-events-auto rounded-none"
          >
            <ChevronRight className="w-6 h-6 text-gray-800 group-hover:text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );

  const MobileImageGallery = (
    <div className={`embla h-full overflow-hidden ${fullPage ? 'absolute inset-0' : 'relative'}`} ref={mobileViewRef}>
      <div className="embla__container h-full flex">
        {images.map((image, index) => (
          <div 
            key={image} 
            className="embla__slide relative w-full h-full flex-[0_0_100%]"
          >
            <Image
              src={image}
              alt={`${product.name} - Vue ${index + 1}`}
              fill
              className={`select-none ${
                index === 0 
                  ? "object-cover"
                  : "object-contain"
              }`}
              sizes="100vw"
              priority={index === 0}
              draggable={false}
              quality={100}
            />
            {/* Watermark */}
            <div className={`absolute bottom-[52px] left-1/2 -translate-x-1/2 w-20 h-20 opacity-75 mix-blend-overlay ${fullPage ? 'hidden' : ''}`}>
              <Image
                src={WATERMARK_URL}
                alt="Sketch Design"
                fill
                className="object-contain brightness-0 invert"
                sizes="80px"
              />
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-none">
                <span className="text-white text-sm font-medium">
                  {currentImageIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const content = fullPage ? (
    <div className="fixed top-[64px] inset-x-0 bottom-0 w-screen h-[calc(100vh-64px)]">
      {/* Mobile Layout */}
      <div className="lg:hidden w-full h-full overflow-y-auto pb-20">
        {/* Image section */}
        <div className="w-full h-[40vh] relative bg-[#E8E8E6]">
          {MobileImageGallery}
        </div>

        {/* Content section */}
        <div className="bg-white">
          <div className="p-4">
            {/* Product Info */}
            <div className="space-y-4">
              {/* Product Name and Labels group */}
              <div className="pt-1">
                <h1 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent uppercase leading-tight sm:leading-tight lg:leading-tight mb-3"
                  style={{ wordBreak: 'break-word' }}
                >
                  {product.name}
                </h1>

                {/* Category and Dimensions */}
                <div className="flex flex-wrap gap-1.5">
                  <div 
                    onClick={handleCategoryClick}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Tag size={12} />
                    <span className="text-xs font-medium">{product.subCategory}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 rounded-full">
                    <Ruler size={12} />
                    <span className="text-xs font-medium">{product.dimensions}</span>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-gray-50/80 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-baseline gap-2">
                    <div className="relative">
                      <div className="absolute -inset-1.5 sm:-inset-2 -left-0 bg-gradient-to-r from-yellow-400 to-amber-300 -skew-x-12 rounded-lg shadow-lg" />
                      <span className="relative text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 px-2 sm:px-3 py-0.5 sm:py-1">
                        {product.VenteflashPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                      </span>
                    </div>
                    <span className="text-sm sm:text-base text-gray-400 line-through ml-2">
                      {product.initialPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                    </span>
                  </div>
                </div>
              </div>

              {/* Store Availability */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={16} className="text-gray-900" />
                      <h3 className="text-base font-semibold text-gray-900">
                        Disponibilité en magasin
                      </h3>
                  </div>
                </div>
                <div className="p-5">
                  {availability ? (
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                      {storeOrder.map(renderStoreAvailability)}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
                    </div>
                  )}
                </div>
              </div>

              {/* Product Description */}
              <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Tag size={14} className="text-gray-600" />
                    Description du produit
                  </h3>
                </div>
                <div className="p-5">
                  {productDescription ? (
                    <div className="space-y-4">
                      {productDescription.split('\n')
                        .filter(paragraph => paragraph.trim())
                        .map((paragraph, index) => {
                          const isBulletPoint = paragraph.trim().startsWith('-') || 
                                             paragraph.trim().startsWith('•');
                          
                          const isHeading = paragraph.trim().toUpperCase() === paragraph.trim() || 
                                          paragraph.trim().endsWith(':');
                          
                          if (isHeading) {
                            return (
                              <h4 
                                key={index}
                                className="text-sm font-semibold text-gray-800 mt-4 first:mt-0"
                              >
                                {paragraph.trim()}
                              </h4>
                            );
                          }
                          
                          if (isBulletPoint) {
                            return (
                              <div key={index} className="flex items-start gap-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <p className="text-sm text-gray-600 leading-relaxed flex-1">
                                  {paragraph.trim().replace(/^[-•]/, '').trim()}
                                </p>
                              </div>
                            );
                          }
                          
                          return (
                            <p 
                              key={index}
                              className="text-sm text-gray-600 leading-relaxed"
                            >
                              {paragraph.trim()}
                            </p>
                          );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-pulse flex items-center gap-2 text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Chargement de la description...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Proof */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between bg-white/50 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="p-1 bg-blue-100 rounded-full"
                    >
                      <Eye size={16} className="text-blue-600" />
                    </motion.div>
                    <div className="flex items-center gap-1">
                      {isClient && (
                        <motion.span 
                          className="text-base font-bold text-blue-700"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {viewersCount}
                        </motion.span>
                      )}
                      <span className="text-sm text-blue-600">personnes regardent</span>
                    </div>
                  </div>
                  <motion.div 
                    className="flex items-center px-2 py-1 bg-red-100 text-red-600 rounded-full"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  >
                    <Fire size={12} className="mr-1" />
                    <span className="text-xs font-medium">Forte demande</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed WhatsApp button - Adjust z-index and positioning */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
          <button
            onClick={handleWhatsAppOrder}
            className="w-full bg-[#23D366] hover:bg-[#1fb855] text-white py-4 px-4 flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
          >
            {/* Pulsing icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75" />
              <WhatsappIcon 
                size={24} 
                className="relative z-10" 
                round={false}
                bgStyle={{ fill: "transparent" }}
                iconFillColor="white"
              />
            </div>

            {/* Text */}
            <span className="text-base font-semibold relative z-10 flex items-center gap-1">
              Commander maintenant
              <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-200">
                →
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full h-full">
        {/* Fixed left side with image */}
        <div className="w-1/2 relative bg-[#E8E8E6]">
          {DesktopImageGallery}
        </div>
        {/* Scrollable right side */}
        <div className="w-1/2 h-full overflow-y-auto bg-white">
          <div className="p-8">
            {/* Product Info */}
            <div className="space-y-6">
              {/* Product Name and Labels group */}
              <div className="pt-1">
                <h1 
                  className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent uppercase leading-tight mb-4"
                  style={{ wordBreak: 'break-word' }}
                >
                  {product.name}
                </h1>

                {/* Category and Dimensions */}
                <div className="flex flex-wrap gap-2">
                  <div 
                    onClick={handleCategoryClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Tag size={14} />
                    <span className="text-sm font-medium">{product.subCategory}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full">
                    <Ruler size={14} />
                    <span className="text-sm font-medium">{product.dimensions}</span>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-gray-50/80 rounded-xl p-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <div className="relative">
                      <div className="absolute -inset-2 -left-0 bg-gradient-to-r from-yellow-400 to-amber-300 -skew-x-12 rounded-lg shadow-lg" />
                      <span className="relative text-4xl font-bold text-gray-900 px-3 py-1">
                        {product.VenteflashPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                      </span>
                    </div>
                    <span className="text-lg text-gray-400 line-through">
                      {product.initialPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                    </span>
                  </div>

                  {/* Discount and Offer badges */}
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg text-sm font-bold">
                        -{discountPercentage}%
                      </span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-lg"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    >
                      <Clock size={14} className="mr-1.5" />
                      <span className="text-sm font-medium">Offre limitée</span>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Tag size={14} className="text-gray-600" />
                    Description du produit
                  </h3>
                </div>
                <div className="p-5">
                  {productDescription ? (
                    <div className="space-y-4">
                      {productDescription.split('\n')
                        .filter(paragraph => paragraph.trim())
                        .map((paragraph, index) => {
                          const isBulletPoint = paragraph.trim().startsWith('-') || 
                                             paragraph.trim().startsWith('•');
                          
                          const isHeading = paragraph.trim().toUpperCase() === paragraph.trim() || 
                                          paragraph.trim().endsWith(':');
                          
                          if (isHeading) {
                            return (
                              <h4 
                                key={index}
                                className="text-sm font-semibold text-gray-800 mt-4 first:mt-0"
                              >
                                {paragraph.trim()}
                              </h4>
                            );
                          }
                          
                          if (isBulletPoint) {
                            return (
                              <div key={index} className="flex items-start gap-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <p className="text-sm text-gray-600 leading-relaxed flex-1">
                                  {paragraph.trim().replace(/^[-•]/, '').trim()}
                                </p>
                              </div>
                            );
                          }
                          
                          return (
                            <p 
                              key={index}
                              className="text-sm text-gray-600 leading-relaxed"
                            >
                              {paragraph.trim()}
                            </p>
                          );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-pulse flex items-center gap-2 text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Chargement de la description...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Store Availability */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-900 rounded-lg">
                      <ShoppingBag size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Disponibilité en magasin
                      </h3>
                      {availability && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {Object.values(availability).filter(stock => stock > 0).length} magasins disponibles
                        </p>
                      )}
                    </div>
                  </div>
                  {availability && (
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${Object.values(availability).some(stock => stock > 0)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                      }
                    `}>
                      {Object.values(availability).some(stock => stock > 0) ? 'Stock disponible' : 'Stock limité'}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  {availability ? (
                    <div className="grid grid-cols-2 gap-4">
                      {storeOrder.map(renderStoreAvailability)}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Order Button */}
              <button
                onClick={handleWhatsAppOrder}
                className="group relative w-full bg-[#23D366] hover:bg-[#1fb855] text-white rounded-lg py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden shadow-lg shadow-[#23D366]/20"
              >
                <WhatsappIcon 
                  size={28} 
                  className="relative z-10" 
                  round={false}
                  bgStyle={{ fill: "transparent" }}
                  iconFillColor="white"
                />
                <span className="text-lg font-semibold relative z-10 flex items-center gap-2">
                  Commander maintenant
                  <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="container mx-auto px-4 py-8">
      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col">
        <div className="w-full relative aspect-[4/3] bg-[#E8E8E6]">
          {MobileImageGallery}
        </div>

        {/* Add padding at the bottom to prevent overlap with floating button */}
        <div className="pb-20">
          {/* Content Section for Mobile */}
          <div className="flex-1 bg-white">
            <div className="p-4">
              {/* Product Info */}
              <div className="space-y-4">
                {/* Product Name and Labels group */}
                <div className="pt-1">
                  <h1 
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent uppercase leading-tight sm:leading-tight lg:leading-tight mb-3"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {product.name}
                  </h1>

                  {/* Category and Dimensions */}
                  <div className="flex flex-wrap gap-1.5">
                    <div 
                      onClick={handleCategoryClick}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                    >
                      <Tag size={12} />
                      <span className="text-xs font-medium">{product.subCategory}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-700 rounded-full">
                      <Ruler size={12} />
                      <span className="text-xs font-medium">{product.dimensions}</span>
                    </div>
                  </div>
                </div>

                {/* Price Section */}
                <div className="bg-gray-50/80 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <div className="relative">
                        <div className="absolute -inset-1.5 sm:-inset-2 -left-0 bg-gradient-to-r from-yellow-400 to-amber-300 -skew-x-12 rounded-lg shadow-lg" />
                        <span className="relative text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 px-2 sm:px-3 py-0.5 sm:py-1">
                          {product.VenteflashPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                        </span>
                      </div>
                      <span className="text-sm sm:text-base text-gray-400 line-through ml-2">
                        {product.initialPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                      </span>
                    </div>
                  </div>
                </div>

                {/* Store Availability */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <ShoppingBag size={16} className="text-gray-900" />
                        <h3 className="text-base font-semibold text-gray-900">
                          Disponibilité en magasin
                        </h3>
                    </div>
                  </div>
                  <div className="p-5">
                    {availability ? (
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                        {storeOrder.map(renderStoreAvailability)}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Description */}
                <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                  <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Tag size={14} className="text-gray-600" />
                      Description du produit
                    </h3>
                  </div>
                  <div className="p-5">
                    {productDescription ? (
                      <div className="space-y-4">
                        {productDescription.split('\n')
                          .filter(paragraph => paragraph.trim())
                          .map((paragraph, index) => {
                            const isBulletPoint = paragraph.trim().startsWith('-') || 
                                               paragraph.trim().startsWith('•');
                            
                            const isHeading = paragraph.trim().toUpperCase() === paragraph.trim() || 
                                            paragraph.trim().endsWith(':');
                            
                            if (isHeading) {
                              return (
                                <h4 
                                  key={index}
                                  className="text-sm font-semibold text-gray-800 mt-4 first:mt-0"
                                >
                                  {paragraph.trim()}
                                </h4>
                              );
                            }
                            
                            if (isBulletPoint) {
                              return (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="text-gray-400 mt-1">•</span>
                                  <p className="text-sm text-gray-600 leading-relaxed flex-1">
                                    {paragraph.trim().replace(/^[-•]/, '').trim()}
                                  </p>
                                </div>
                              );
                            }
                            
                            return (
                              <p 
                                key={index}
                                className="text-sm text-gray-600 leading-relaxed"
                              >
                                {paragraph.trim()}
                              </p>
                            );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-pulse flex items-center gap-2 text-gray-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Chargement de la description...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Proof */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between bg-white/50 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="p-1 bg-blue-100 rounded-full"
                      >
                        <Eye size={16} className="text-blue-600" />
                      </motion.div>
                      <div className="flex items-center gap-1">
                        {isClient && (
                          <motion.span 
                            className="text-base font-bold text-blue-700"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {viewersCount}
                          </motion.span>
                        )}
                        <span className="text-sm text-blue-600">personnes regardent</span>
                      </div>
                    </div>
                    <motion.div 
                      className="flex items-center px-2 py-1 bg-red-100 text-red-600 rounded-full"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    >
                      <Fire size={12} className="mr-1" />
                      <span className="text-xs font-medium">Forte demande</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp button for mobile */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <button
          onClick={handleWhatsAppOrder}
          className="group relative w-full bg-[#23D366] hover:bg-[#1fb855] text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 transition-all duration-300 overflow-hidden shadow-lg shadow-[#23D366]/20"
        >
          {/* Pulsing icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75" />
            <WhatsappIcon 
              size={24} 
              className="relative z-10" 
              round={false}
              bgStyle={{ fill: "transparent" }}
              iconFillColor="white"
            />
          </div>

          {/* Text */}
          <span className="text-base font-semibold relative z-10 flex items-center gap-1">
            Commander maintenant
            <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-200">
              →
            </span>
          </span>
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="w-1/2 bg-[#E8E8E6] relative">
          {DesktopImageGallery}
        </div>
        <div className="w-1/2 bg-white overflow-y-auto">
          <div className="p-8">
            {/* Product Info */}
            <div className="space-y-6">
              {/* Product Name and Labels group */}
              <div className="pt-1">
                <h1 
                  className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 bg-clip-text text-transparent uppercase leading-tight mb-4"
                  style={{ wordBreak: 'break-word' }}
                >
                  {product.name}
                </h1>

                {/* Category and Dimensions */}
                <div className="flex flex-wrap gap-2">
                  <div 
                    onClick={handleCategoryClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                  >
                    <Tag size={14} />
                    <span className="text-sm font-medium">{product.subCategory}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full">
                    <Ruler size={14} />
                    <span className="text-sm font-medium">{product.dimensions}</span>
                  </div>
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-gray-50/80 rounded-xl p-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <div className="relative">
                      <div className="absolute -inset-2 -left-0 bg-gradient-to-r from-yellow-400 to-amber-300 -skew-x-12 rounded-lg shadow-lg" />
                      <span className="relative text-4xl font-bold text-gray-900 px-3 py-1">
                        {product.VenteflashPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                      </span>
                    </div>
                    <span className="text-lg text-gray-400 line-through">
                      {product.initialPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                    </span>
                  </div>

                  {/* Discount and Offer badges */}
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg text-sm font-bold">
                        -{discountPercentage}%
                      </span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-lg"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    >
                      <Clock size={14} className="mr-1.5" />
                      <span className="text-sm font-medium">Offre limitée</span>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Tag size={14} className="text-gray-600" />
                    Description du produit
                  </h3>
                </div>
                <div className="p-5">
                  {productDescription ? (
                    <div className="space-y-4">
                      {productDescription.split('\n')
                        .filter(paragraph => paragraph.trim())
                        .map((paragraph, index) => {
                          const isBulletPoint = paragraph.trim().startsWith('-') || 
                                             paragraph.trim().startsWith('•');
                          
                          const isHeading = paragraph.trim().toUpperCase() === paragraph.trim() || 
                                          paragraph.trim().endsWith(':');
                          
                          if (isHeading) {
                            return (
                              <h4 
                                key={index}
                                className="text-sm font-semibold text-gray-800 mt-4 first:mt-0"
                              >
                                {paragraph.trim()}
                              </h4>
                            );
                          }
                          
                          if (isBulletPoint) {
                            return (
                              <div key={index} className="flex items-start gap-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <p className="text-sm text-gray-600 leading-relaxed flex-1">
                                  {paragraph.trim().replace(/^[-•]/, '').trim()}
                                </p>
                              </div>
                            );
                          }
                          
                          return (
                            <p 
                              key={index}
                              className="text-sm text-gray-600 leading-relaxed"
                            >
                              {paragraph.trim()}
                            </p>
                          );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-pulse flex items-center gap-2 text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Chargement de la description...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Store Availability */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-900 rounded-lg">
                      <ShoppingBag size={16} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Disponibilité en magasin
                      </h3>
                      {availability && (
                        <p className="text-sm text-gray-500 mt-0.5">
                          {Object.values(availability).filter(stock => stock > 0).length} magasins disponibles
                        </p>
                      )}
                    </div>
                  </div>
                  {availability && (
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      ${Object.values(availability).some(stock => stock > 0)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                      }
                    `}>
                      {Object.values(availability).some(stock => stock > 0) ? 'Stock disponible' : 'Stock limité'}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  {availability ? (
                    <div className="grid grid-cols-2 gap-4">
                      {storeOrder.map(renderStoreAvailability)}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Order Button */}
              <button
                onClick={handleWhatsAppOrder}
                className="group relative w-full bg-[#23D366] hover:bg-[#1fb855] text-white rounded-lg py-4 px-6 flex items-center justify-center gap-3 transition-all duration-300 overflow-hidden shadow-lg shadow-[#23D366]/20"
              >
                <WhatsappIcon 
                  size={28} 
                  className="relative z-10" 
                  round={false}
                  bgStyle={{ fill: "transparent" }}
                  iconFillColor="white"
                />
                <span className="text-lg font-semibold relative z-10 flex items-center gap-2">
                  Commander maintenant
                  <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-200">
                    →
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Return content directly if fullPage is true
  if (fullPage) {
    return content;
  }

  // Otherwise wrap in Dialog for modal view
  return (
    <AnimatePresence>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="!p-0 !pr-0 rounded-none max-w-[95vw] sm:max-w-[90vw] md:max-w-[1250px] lg:max-w-[1500px] overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-[100] p-2 sm:p-2.5 bg-black/80 hover:bg-black/90 backdrop-blur-sm rounded-none shadow-lg transition-all duration-200 border border-white/20 group"
            aria-label="Fermer"
          >
            <X 
              size={24} 
              className="text-white/90 group-hover:text-white group-hover:scale-110 transition-transform duration-200" 
            />
          </button>
          {content}
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}

