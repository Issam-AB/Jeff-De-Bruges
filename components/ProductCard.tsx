'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/types'
import { Tag, Ruler, Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
  onQuickView?: () => void
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Add the watermark image URL
const WATERMARK_URL = 'https://zruplcd5sfldkzdm.public.blob.vercel-storage.com/SketchDesign.svg'

const getCategoryColor = (category: string) => {
  const stringToColor = (str: string, lightness: number) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 30%, ${lightness}%)`;
  };

  const baseColor = stringToColor(category, 30);
  const lighterColor = stringToColor(category, 40);
  return { baseColor, lighterColor };
};

export default function ProductCard({ product, className, onQuickView }: ProductCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { baseColor, lighterColor } = getCategoryColor(product.mainCategory);

  // Use VenteflashPrice instead of price
  const price = product.VenteflashPrice;

  // Simplified stock status - show as available by default for better UX
  const stockStatus = {
    icon: <Check className="h-4 w-4 text-emerald-50" />,
    text: "Disponible",
    textColor: "text-white",
    bgColor: "bg-emerald-500",
    borderColor: "border-emerald-600"
  };

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsLoading(true); // Show loading immediately!
    router.push(`/products/${product.slug}`);
  };

  return (
    <div 
      onClick={handleClick}
      onTouchEnd={handleClick}
      role="button"
      tabIndex={0}
      className={cn(
        "block group relative overflow-hidden transition-all duration-200",
        "bg-gray-900 border border-gray-700 rounded-lg",
        "hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]",
        "active:scale-[0.98]",
        "shadow-[0_4px_15px_rgba(0,0,0,0.2)]",
        "touch-manipulation cursor-pointer select-none",
        "-webkit-tap-highlight-color: transparent",
        className
      )}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
        {/* Loading Overlay - Shows immediately on tap! */}
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
              <p className="text-white font-semibold text-sm">Chargement...</p>
            </div>
          </div>
        )}

        <div className="relative p-0 pointer-events-none">
          {/* Product Image */}
          <div className="relative aspect-square rounded-t-lg overflow-hidden">
            <Image
              src={product.mainImage}
              alt={product.name}
              fill
              sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover pointer-events-none"
              loading="lazy"
              quality={75}
            />
            
            {/* Watermark */}
            <div className="absolute bottom-1 right-1 w-8 h-8 opacity-75 mix-blend-overlay">
              <Image
                src={WATERMARK_URL}
                alt="Sketch Design"
                fill
                className="object-contain brightness-0 invert"
                sizes="32px"
              />
            </div>

            {/* Top left - Heress logo */}
            <div className="absolute left-2 top-2">
              <div className="px-2 py-1">
                <Image
                  src="/Logo_heress.png"
                  alt="Heress"
                  width={100}
                  height={40}
                  className="object-contain"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Top right - Discount badge */}
            <div className="absolute right-2 top-2">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1.5 rounded-lg shadow-lg">
                <span className="text-white text-sm font-bold">
                  -{Math.round(((product.initialPrice - product.VenteflashPrice) / product.initialPrice) * 100)}%
                </span>
              </div>
            </div>

          </div>
        </div>

        <div className="flex-grow flex flex-col justify-between w-full py-3 px-2 pointer-events-none">
          <div className="mb-2 w-full">
            <h3 className="font-semibold text-base mb-1 uppercase line-clamp-2 text-white">{product.name}</h3>
            <div className="flex flex-wrap gap-1">
              <Badge 
                variant="custom"
                className="text-xs font-semibold px-2 py-0.5 text-white border-none rounded-none"
                style={{
                  background: `linear-gradient(to right, ${baseColor}, ${lighterColor})`
                }}
              >
                <Tag className="h-3 w-3 mr-1" />
                {product.subCategory}
              </Badge>
              <Badge 
                variant="outline" 
                className="text-xs font-semibold bg-gray-800 border-gray-600 text-gray-300 px-2 py-0.5 rounded-none"
              >
                <Ruler className="h-3 w-3 mr-1" />
                {product.dimensions}
              </Badge>
            </div>
          </div>

          <div className="mt-auto w-full">
            {/* Premium bottom section with gradient background */}
            <div className="relative overflow-hidden rounded-b-lg">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600" />
              
              {/* Content */}
              <div className="relative p-4">
                <div className="flex items-center justify-between">
                  {/* Price section */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="text-2xl font-bold text-white">
                        {price.toLocaleString('fr-FR').replace(',', ' ')} DH
                      </span>
                    </div>
                    <span className="text-sm text-white/70 line-through">
                      {product.initialPrice.toLocaleString('fr-FR').replace(',', ' ')} DH
                    </span>
                  </div>

                  {/* Stock status */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 ${stockStatus.bgColor} ${stockStatus.borderColor}`}>
                    {stockStatus.icon}
                    <span className={`text-sm font-semibold ${stockStatus.textColor}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
 