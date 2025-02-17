'use client'

import Image from 'next/image'
import Header from './Header'
import './animations.css'
import { useEffect, useState } from 'react'

interface PageLayoutProps {
  children: React.ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  // Use client-side only rendering for dynamic styles
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Generate random values only on the client side
  const generateRandomStyle = () => {
    if (!isMounted) return {}
    return {
      '--delay': `${Math.random() * 5}s`,
      '--size': `${Math.random() * 6}px`,
      '--start-pos': `${Math.random() * 100}%`
    } as React.CSSProperties
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Base background - brighter and consistent */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#333333] via-[#383838] to-[#333333]" />
        
        {/* Subtle radial overlays for depth */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-[#404040] to-transparent rounded-full opacity-50" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-tl from-[#404040] to-transparent rounded-full opacity-50" />
      </div>
      
      {/* Particles container */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="particle-container">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className={`particle particle-${i + 1}`}
              style={generateRandomStyle()}
            />
          ))}
        </div>
      </div>
      
      <Header />
      
      {/* Large Sketch logo */}
      <div className="fixed top-[100px] left-0 right-0 w-full flex justify-center pointer-events-none">
        <div className="w-full max-w-[600px] px-4">
          <Image
            src="https://zruplcd5sfldkzdm.public.blob.vercel-storage.com/SketchDesign.svg"
            alt="Sketch Design"
            width={600}
            height={240}
            priority
            className="w-full h-auto object-contain invert opacity-[0.06]"
          />
        </div>
      </div>
      
      {/* Content area */}
      <div className="relative flex-1 container mx-auto px-4 pb-8 mt-[100px]">
        {isMounted ? (
          <div style={generateRandomStyle()}>
            {children}
          </div>
        ) : (
          // Initial server render without dynamic styles
          <div>
            {children}
          </div>
        )}
      </div>
    </main>
  )
} 