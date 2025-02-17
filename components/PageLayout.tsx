'use client'

import Image from 'next/image'
import Header from './Header'
import Footer from './Footer'
import './animations.css'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface PageLayoutProps {
  children: React.ReactNode
}

const SKETCH_LOGO = 'https://zruplcd5sfldkzdm.public.blob.vercel-storage.com/SketchDesign.svg'

export default function PageLayout({ children }: PageLayoutProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Generate random style for floating elements
  const generateRandomStyle = () => {
    if (!isMounted) return {}
    return {
      '--delay': `${Math.random() * 5}s`,
      '--size': `${Math.random() * 6}px`,
      '--start-pos': `${Math.random() * 100}%`
    } as React.CSSProperties
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white">
          {/* Sketch Logo Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            {[...Array(6)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex justify-around">
                {[...Array(6)].map((_, colIndex) => (
                  <Image
                    key={`${rowIndex}-${colIndex}`}
                    src={SKETCH_LOGO}
                    alt=""
                    width={100}
                    height={40}
                    className="w-24 h-auto object-contain opacity-50 rotate-12 transform hover:scale-110 transition-transform duration-500"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Floating Elements */}
        {isMounted && [...Array(20)].map((_, index) => (
          <motion.div
            key={index}
            className="floating-element absolute"
            style={generateRandomStyle()}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
        <Footer />
      </div>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-red-500 origin-left z-50"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isMounted ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
} 