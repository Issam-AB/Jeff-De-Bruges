'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, ChevronDown, Sofa, Bed, Table2 as Table, Armchair as Chair, Palmtree, Home, LayoutGrid } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import SearchModal from './SearchModal'

// Define category type
type Category = 'Tous' | 'Salons' | 'Canapés' | 'Chambre' | 'Tables' | 'Chaises' | 'Jardin' | 'Meubles'

const categories: Category[] = [
  'Tous', 'Salons', 'Canapés', 'Chambre', 'Tables', 'Chaises', 'Jardin', 'Meubles'
]

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<Category | null>('Tous')

  // Update getActiveCategory to use the Category type
  const getActiveCategory = useCallback((): Category | null => {
    if (pathname?.startsWith('/products/')) return null;
    
    if (pathname === '/categories/tous' || pathname === '/') return 'Tous';
    const match = pathname.match(/\/categories\/([^/]+)/);
    if (match) {
      const categorySlug = decodeURIComponent(match[1]);
      return categories.find(cat => 
        cat.toLowerCase().replace(/\s+/g, '-') === categorySlug
      ) as Category || 'Tous';
    }
    return 'Tous';
  }, [pathname]);

  useEffect(() => {
    setActiveCategory(getActiveCategory())
  }, [pathname, getActiveCategory])

  const handleCategoryClick = (category: Category) => {
    if (category === activeCategory) return;

    setActiveCategory(category)
    setIsMobileMenuOpen(false)

    const categorySlug = category
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zà-ÿ0-9-]/g, '')

    router.push(`/categories/${categorySlug}`, { scroll: false })
  }

  // Logo click handler - now goes to "Tous" category
  const handleLogoClick = () => {
    handleCategoryClick('Tous')
  }

  // Update the click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const menuButton = document.getElementById('mobile-menu-button')
      
      // If clicking the menu button, let the onClick handler handle it
      if (menuButton?.contains(target)) {
        return
      }

      // Otherwise, close the menu when clicking outside
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  return (
    <>
      <header className="fixed w-full top-0 z-[100]">
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
            {/* Logo - Updated size to be smaller */}
            <Link 
              href="/" 
              onClick={handleLogoClick}
              className="relative group"
            >
              <div className="absolute inset-0 bg-orange-500/20 blur-2xl group-hover:bg-orange-500/30 transition-all duration-500" />
              <Image
                src="/Logo_bf.png"
                alt="SKETCH BLACK FRIDAY"
                width={160}
                height={80}
                priority
                className="relative z-10"
              />
            </Link>

            {/* Desktop Navigation - centered */}
            <nav className="hidden md:flex items-center justify-center flex-1 space-x-6">
              {categories.map((category) => (
                <motion.div
                  key={category}
                  className="relative"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="relative h-[40px] px-6 group"
                  >
                    {/* Sharp skewed background with multiple layers */}
                    <div className={`
                      absolute inset-0 transform -skew-x-[30deg] transition-all duration-300
                      ${activeCategory === category
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
                      ${activeCategory === category
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-white'
                      }
                      transition-colors duration-300
                      clip-path-sharp
                    `}>
                      <span className="font-bold tracking-wider text-sm uppercase">{category}</span>
                    </div>

                    {/* Sharp bottom accent */}
                    <div className={`
                      absolute -bottom-[3px] left-[6px] right-[6px] h-[2px] transform -skew-x-[30deg]
                      ${activeCategory === category
                        ? 'bg-orange-500 shadow-[0_0_10px_rgb(249,115,22)]'
                        : 'bg-transparent group-hover:bg-orange-500/50'
                      }
                      transition-all duration-300
                    `} />
                  </button>
                </motion.div>
              ))}
            </nav>

            {/* Mobile Menu and Search - moved to right */}
            <div className="md:hidden flex items-center gap-3 ml-auto">
              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsSearchOpen(true)}
                className="relative h-[40px] px-4 group"
              >
                {/* Sharp skewed background */}
                <div className="absolute inset-0 transform -skew-x-[30deg] bg-gray-800/50 
                  group-hover:bg-orange-500/20 transition-all duration-300" />
                
                {/* Sharp edges glow */}
                <div className="absolute inset-0 transform -skew-x-[30deg]
                  before:absolute before:inset-y-0 before:-left-[2px] before:w-[3px]
                  before:bg-gradient-to-b before:from-transparent before:via-orange-500 before:to-transparent
                  after:absolute after:inset-y-0 after:-right-[2px] after:w-[3px]
                  after:bg-gradient-to-b after:from-transparent after:via-orange-500 after:to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
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
                  {/* Sharp skewed background */}
                  <div className="absolute inset-0 transform -skew-x-[30deg] bg-gradient-to-r from-orange-500 to-red-600 
                    group-hover:from-orange-600 group-hover:to-red-700 transition-all duration-300
                    before:absolute before:inset-0 
                    before:transform before:translate-x-[6px] before:translate-y-[6px]
                    before:bg-orange-500 before:blur-[8px]
                    before:opacity-50 group-hover:before:opacity-100
                    before:transition-opacity before:duration-300" />
                  
                  {/* Sharp edges glow */}
                  <div className="absolute inset-0 transform -skew-x-[30deg]
                    before:absolute before:inset-y-0 before:-left-[2px] before:w-[3px]
                    before:bg-gradient-to-b before:from-transparent before:via-white before:to-transparent
                    after:absolute after:inset-y-0 after:-right-[2px] after:w-[3px]
                    after:bg-gradient-to-b after:from-transparent after:via-white after:to-transparent
                    opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex items-center gap-2 text-white transition-colors">
                    <Menu size={18} className="relative z-10" />
                    <span className="font-bold tracking-wider text-sm uppercase">{activeCategory}</span>
                    <ChevronDown 
                      size={16} 
                      className={`
                        transition-all duration-300
                        ${isMobileMenuOpen ? 'rotate-180' : ''}
                      `}
                    />
                  </div>

                  {/* Bottom accent */}
                  <div className={`
                    absolute -bottom-[3px] left-[6px] right-[6px] h-[2px] transform -skew-x-[30deg]
                    bg-white/50 group-hover:bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]
                    transition-all duration-300
                  `} />
                </button>
              </motion.div>
            </div>

            {/* Desktop Search Button - moved to right */}
            <motion.button
              className="hidden md:flex items-center h-[40px] px-6 relative group -mr-4"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSearchOpen(true)}
            >
              {/* Sharp skewed background */}
              <div className="absolute inset-0 transform -skew-x-[30deg] bg-gray-800/50 
                group-hover:bg-orange-500/20 transition-all duration-300
                before:absolute before:inset-0 
                before:transform before:translate-x-[6px] before:translate-y-[6px]
                before:bg-orange-500/20 before:blur-[8px]
                before:opacity-0 group-hover:before:opacity-100
                before:transition-opacity before:duration-300" />
              
              {/* Sharp edges glow */}
              <div className="absolute inset-0 transform -skew-x-[30deg]
                before:absolute before:inset-y-0 before:-left-[2px] before:w-[3px]
                before:bg-gradient-to-b before:from-transparent before:via-orange-500 before:to-transparent
                after:absolute after:inset-y-0 after:-right-[2px] after:w-[3px]
                after:bg-gradient-to-b after:from-transparent after:via-orange-500 after:to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
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

      {/* Add this to your CSS */}
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
              {/* Background effects */}
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
                      key={category}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <button
                        onClick={() => handleCategoryClick(category)}
                        className="w-full relative h-[50px] group"
                      >
                        {/* Sharp skewed background */}
                        <div className={`
                          absolute inset-0 transform -skew-x-[30deg] transition-all duration-300
                          ${activeCategory === category
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

                        {/* Shine effect */}
                        <div className="
                          absolute inset-0 transform -skew-x-[30deg] overflow-hidden
                          before:absolute before:inset-0 
                          before:w-[200%] before:h-full
                          before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
                          before:-translate-x-full group-hover:before:translate-x-full
                          before:transition-transform before:duration-700 before:ease-out
                        "/>

                        {/* Text Content */}
                        <div className={`
                          relative z-10 h-full flex items-center justify-center
                          ${activeCategory === category
                            ? 'text-white'
                            : 'text-gray-400 group-hover:text-white'
                          }
                          transition-colors duration-300
                        `}>
                          <span className="font-bold tracking-wider text-base uppercase">{category}</span>
                        </div>

                        {/* Bottom accent */}
                        <div className={`
                          absolute -bottom-[3px] left-[6px] right-[6px] h-[2px] transform -skew-x-[30deg]
                          ${activeCategory === category
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

              {/* Bottom gradient border */}
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

