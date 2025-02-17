'use client'

import Image from 'next/image'
import Header from './Header'
import Footer from './Footer'
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
} 