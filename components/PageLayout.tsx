'use client'

import Image from 'next/image'
import Header from './Header'
import './animations.css'

interface PageLayoutProps {
  children: React.ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Base background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#111] to-[#1a1a1a]" />
      
      {/* Particles container */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Floating particles */}
        <div className="particle-container">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className={`particle particle-${i + 1}`}
              style={{
                '--delay': `${Math.random() * 5}s`,
                '--size': `${Math.random() * 4 + 2}px`,
                '--start-pos': `${Math.random() * 100}%`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
      
      <Header />
      
      {/* Large Sketch logo */}
      <div className="relative w-full flex justify-center mt-[100px] mb-16">
        <div className="w-full max-w-[1000px] px-4">
          <Image
            src="https://zruplcd5sfldkzdm.public.blob.vercel-storage.com/SketchDesign.svg"
            alt="Sketch Design"
            width={1000}
            height={400}
            priority
            className="w-full h-auto object-contain invert opacity-[0.15]"
          />
        </div>
      </div>
      
      {/* Content area */}
      <div className="relative flex-1 container mx-auto px-4 pb-8">
        <div className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/[0.05] p-6">
          {children}
        </div>
      </div>
    </main>
  )
} 