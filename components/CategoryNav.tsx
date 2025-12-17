'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

interface Category {
  name: string
  slug: string
  count: number
}

interface CategoryNavProps {
  categories: Category[]
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  const pathname = usePathname()
  const [activeCategory, setActiveCategory] = useState<string>('tous')

  useEffect(() => {
    if (pathname === '/categories/tous' || pathname === '/') {
      setActiveCategory('tous')
    } else {
      const match = pathname?.match(/\/categories\/([^/]+)/)
      if (match) {
        const categorySlug = decodeURIComponent(match[1])
        // Find matching category by slug
        const matchingCategory = categories.find(c => c.slug === categorySlug)
        if (matchingCategory) {
          setActiveCategory(matchingCategory.slug)
        } else {
          setActiveCategory('tous')
        }
      }
    }
  }, [pathname, categories])

  return (
    <nav className="hidden md:flex items-center justify-center flex-1 space-x-6">
      {categories.map((category) => (
        <motion.div
          key={category.slug}
          className="relative"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 500, damping: 15 }}
        >
          <Link
            href={`/categories/${category.slug}`}
            onClick={() => setActiveCategory(category.slug)}
            className="relative h-[40px] px-6 group block"
          >
            {/* Sharp skewed background with multiple layers */}
            <div className={`
              absolute inset-0 transform -skew-x-[30deg] transition-all duration-300
              ${activeCategory === category.slug
                ? 'bg-gradient-to-r from-orange-500 to-red-600 shadow-[0_0_30px_rgba(249,115,22,0.4)]'
                : 'bg-gray-800/50'
              }
              before:absolute before:inset-0 before:transform 
              before:translate-x-[6px] before:translate-y-[6px]
              before:bg-orange-500/20 before:blur-[8px]
              before:opacity-0 group-hover:before:opacity-100
              before:transition-opacity before:duration-300
            `} />
            
            {/* Sharp edges glow */}
            <div className={`
              absolute inset-0 transform -skew-x-[30deg]
              before:absolute before:inset-y-0 before:-left-[2px] before:w-[3px]
              before:bg-gradient-to-b before:from-transparent before:via-orange-500 before:to-transparent
              after:absolute after:inset-y-0 after:-right-[2px] after:w-[3px]
              after:bg-gradient-to-b after:from-transparent after:via-orange-500 after:to-transparent
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
            `} />

            {/* Diagonal shine effect */}
            <div className="
              absolute inset-0 transform -skew-x-[30deg] overflow-hidden
              before:absolute before:inset-0 
              before:w-[200%] before:h-full
              before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
              before:-translate-x-full group-hover:before:translate-x-full
              before:transition-transform before:duration-700 before:ease-out
            "/>

            {/* Text Content with sharp clip-path */}
            <div className={`
              relative z-10 h-full flex items-center justify-center
              ${activeCategory === category.slug
                ? 'text-white'
                : 'text-gray-400 group-hover:text-white'
              }
              transition-colors duration-300
              clip-path-sharp
            `}>
              <span className="font-bold tracking-wider text-sm uppercase">
                {category.name}
                {category.count > 0 && (
                  <span className="ml-2 text-xs opacity-75">({category.count})</span>
                )}
              </span>
            </div>

            {/* Sharp bottom accent */}
            <div className={`
              absolute -bottom-[3px] left-[6px] right-[6px] h-[2px] transform -skew-x-[30deg]
              ${activeCategory === category.slug
                ? 'bg-orange-500 shadow-[0_0_10px_rgb(249,115,22)]'
                : 'bg-transparent group-hover:bg-orange-500/50'
              }
              transition-all duration-300
            `} />
          </Link>
        </motion.div>
      ))}
    </nav>
  )
}
