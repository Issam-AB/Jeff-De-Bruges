'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, ChevronDown } from 'lucide-react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import SearchModal from './SearchModal'
import CategoryNav from './CategoryNav'

interface Category {
  name: string
  slug: string
  count: number
}

interface HeaderClientProps {
  categories: Category[]
}

export default function HeaderClient({ categories }: HeaderClientProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('tous')

  const getActiveCategory = useCallback((): string => {
    if (!pathname || !pathname.startsWith('/')) return 'tous'
    if (pathname.startsWith('/products/') || pathname.startsWith('/articlesrouges/')) return ''

    const selected = searchParams?.get('category') || 'tous'
    return selected
  }, [pathname, searchParams]);

  useEffect(() => {
    setActiveCategory(getActiveCategory())
  }, [pathname, getActiveCategory])

  const handleCategoryClick = (slug: string) => {
    setActiveCategory(slug)
    setIsMobileMenuOpen(false)
    const params = new URLSearchParams(window.location.search)
    if (slug === 'tous') {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    const query = params.toString()
    router.push(query ? `/?${query}` : '/')
  }

  const handleLogoClick = () => {
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const menuButton = document.getElementById('mobile-menu-button')
      
      if (menuButton?.contains(target)) {
        return
      }

      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  const activeCategoryName = categories.find(c => c.slug === activeCategory)?.name || 'Tous'

  return (
    <>
      <header className="fixed w-full top-0 z-[100]" style={{ position: 'fixed', top: '0px', left: '0px', right: '0px' }}>
        {/* Animated background layers */}
        <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800" />
        <div className="absolute inset-0">
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgb(249, 115, 22) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(249, 115, 22) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          {/* Glowing orbs */}
          <div className="absolute top-0 left-1/4 w-24 h-24 bg-orange-500 rounded-full blur-[80px] animate-pulse opacity-30" />
          <div className="absolute top-0 right-1/4 w-24 h-24 bg-red-500 rounded-full blur-[80px] animate-pulse delay-700 opacity-30" />
        </div>

        <div className="relative w-full px-4">
          <div className="flex items-center justify-between h-[80px] gap-4">
            {/* Logo */}
            <Link 
              href="/" 
              onClick={handleLogoClick}
              className="relative group"
            >
              <div className="absolute inset-0 bg-orange-500/20 blur-2xl group-hover:bg-orange-500/30 transition-all duration-500" />
              <Image
                src="/Logo_bf.png"
                alt="Jeff de Bruges - Chocolats"
                width={160}
                height={80}
                priority
                className="relative z-10"
              />
            </Link>

            {/* Desktop Navigation - using CategoryNav */}
            <CategoryNav categories={categories} />

            {/* Mobile Menu and Search */}
            <div className="md:hidden flex items-center gap-3 ml-auto">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsSearchOpen(true)}
                className="relative h-[40px] px-4 group"
              >
                <div className="absolute inset-0 transform -skew-x-[30deg] bg-gray-800/50 
                  group-hover:bg-orange-500/20 transition-all duration-300" />
                <div className="absolute inset-0 transform -skew-x-[30deg]
                  before:absolute before:inset-y-0 before:-left-[2px] before:w-[3px]
                  before:bg-gradient-to-b before:from-transparent before:via-orange-500 before:to-transparent
                  after:absolute after:inset-y-0 after:-right-[2px] after:w-[3px]
                  after:bg-gradient-to-b after:from-transparent after:via-orange-500 after:to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 h-full flex items-center text-gray-400 group-hover:text-white transition-colors">
                  <Search size={20} />
                </div>
              </motion.button>

              {/* Menu Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  id="mobile-menu-button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="relative h-[40px] px-4 group"
                >
                  <div className="absolute inset-0 transform -skew-x-[30deg] bg-gradient-to-r from-orange-500 to-red-600 
                    group-hover:from-orange-600 group-hover:to-red-700 transition-all duration-300
                    before:absolute before:inset-0 
                    before:transform before:translate-x-[6px] before:translate-y-[6px]
                    before:bg-orange-500 before:blur-[8px]
                    before:opacity-50 group-hover:before:opacity-100
                    before:transition-opacity before:duration-300" />
                  <div className="absolute inset-0 transform -skew-x-[30deg]
                    before:absolute before:inset-y-0 before:-left-[2px] before:w-[3px]
                    before:bg-gradient-to-b before:from-transparent before:via-white before:to-transparent
                    after:absolute after:inset-y-0 after:-right-[2px] after:w-[3px]
                    after:bg-gradient-to-b after:from-transparent after:via-white after:to-transparent
                    opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 h-full flex items-center gap-2 text-white transition-colors">
                    <Menu size={18} className="relative z-10" />
                    <span className="font-bold tracking-wider text-sm uppercase">{activeCategoryName}</span>
                    <ChevronDown 
                      size={16} 
                      className={`
                        transition-all duration-300
                        ${isMobileMenuOpen ? 'rotate-180' : ''}
                      `}
                    />
                  </div>
                  <div className={`
                    absolute -bottom-[3px] left-[6px] right-[6px] h-[2px] transform -skew-x-[30deg]
                    bg-white/50 group-hover:bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]
                    transition-all duration-300
                  `} />
                </button>
              </motion.div>
            </div>

            {/* Desktop Search Button */}
            <motion.button
              className="hidden md:flex items-center h-[40px] px-6 relative group -mr-4"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSearchOpen(true)}
            >
              <div className="absolute inset-0 transform -skew-x-[30deg] bg-gray-800/50 
                group-hover:bg-orange-500/20 transition-all duration-300
                before:absolute before:inset-0 
                before:transform before:translate-x-[6px] before:translate-y-[6px]
                before:bg-orange-500/20 before:blur-[8px]
                before:opacity-0 group-hover:before:opacity-100
                before:transition-opacity before:duration-300" />
              <div className="absolute inset-0 transform -skew-x-[30deg]
                before:absolute before:inset-y-0 before:-left-[2px] before:w-[3px]
                before:bg-gradient-to-b before:from-transparent before:via-orange-500 before:to-transparent
                after:absolute after:inset-y-0 after:-right-[2px] after:w-[3px]
                after:bg-gradient-to-b after:from-transparent after:via-orange-500 after:to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                <span className="font-bold tracking-wider text-sm uppercase">Rechercher</span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Animated bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-[shine_3s_ease-in-out_infinite]" />
        </div>
      </header>

      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .clip-path-sharp {
          clip-path: polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%);
        }
      `}</style>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[90]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Content */}
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 right-0 top-[80px] bg-gray-900/95 z-[95] overflow-hidden border-b border-gray-800"
            >
              <div className="absolute inset-0">
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgb(249, 115, 22) 1px, transparent 1px),
                      linear-gradient(to bottom, rgb(249, 115, 22) 1px, transparent 1px)
                    `,
                    backgroundSize: '30px 30px',
                  }}
                />
                <div className="absolute top-0 left-1/4 w-48 h-48 bg-orange-500 rounded-full blur-[100px] animate-pulse opacity-20" />
                <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-red-500 rounded-full blur-[100px] animate-pulse opacity-20 delay-300" />
              </div>

              <div className="w-full px-8 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <motion.div
                      key={category.slug}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <button
                        type="button"
                        onClick={() => handleCategoryClick(category.slug)}
                        className="w-full relative h-[50px] group block"
                      >
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
                        <div className={`
                          absolute inset-0 transform -skew-x-[30deg]
                          before:absolute before:inset-y-0 before:-left-[2px] before:w-[3px]
                          before:bg-gradient-to-b before:from-transparent before:via-orange-500 before:to-transparent
                          after:absolute after:inset-y-0 after:-right-[2px] after:w-[3px]
                          after:bg-gradient-to-b after:from-transparent after:via-orange-500 after:to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        `} />
                        <div className="
                          absolute inset-0 transform -skew-x-[30deg] overflow-hidden
                          before:absolute before:inset-0 
                          before:w-[200%] before:h-full
                          before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
                          before:-translate-x-full group-hover:before:translate-x-full
                          before:transition-transform before:duration-700 before:ease-out
                        "/>
                        <div className={`
                          relative z-10 h-full flex items-center justify-center
                          ${activeCategory === category.slug
                            ? 'text-white'
                            : 'text-gray-400 group-hover:text-white'
                          }
                          transition-colors duration-300
                        `}>
                          <span className="font-bold tracking-wider text-base uppercase">
                            {category.name}
                            {category.count > 0 && (
                              <span className="ml-2 text-xs opacity-75">({category.count})</span>
                            )}
                          </span>
                        </div>
                        <div className={`
                          absolute -bottom-[3px] left-[6px] right-[6px] h-[2px] transform -skew-x-[30deg]
                          ${activeCategory === category.slug
                            ? 'bg-orange-500 shadow-[0_0_10px_rgb(249,115,22)]'
                            : 'bg-transparent group-hover:bg-orange-500/50'
                          }
                          transition-all duration-300
                        `} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-[1px]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  )
}

