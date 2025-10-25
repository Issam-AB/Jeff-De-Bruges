'use client'

import Image from 'next/image'
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
    <main className="flex-1 relative min-h-[100dvh]">
      
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
      
      {/* Large Sketch logo */}
      <div className="fixed top-[100px] left-0 right-0 w-full flex justify-center pointer-events-none">
        <div className="w-full px-2 md:px-8">
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
      <div className="relative w-full px-2 md:px-8 pb-8 min-h-screen">
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