'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { Category, getAllCategories } from '@/lib/categories'
import * as Icons from 'lucide-react'

export default function CategoryNav() {
  const pathname = usePathname()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getAllCategories()
      setCategories(cats)
    }
    fetchCategories()
  }, [])

  return (
    <nav className="hidden md:block">
      <ul className="flex items-center space-x-2">
        {categories.map((category) => (
          <li key={category.id}>
            <CategoryButton 
              category={category}
              isActive={pathname?.includes(category.slug)}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}

function CategoryButton({ 
  category, 
  isActive
}: { 
  category: Category
  isActive: boolean
}) {
  const Icon = Icons[category.icon as keyof typeof Icons]

  return (
    <Link
      href={`/categories/${encodeURIComponent(category.slug.toLowerCase())}`}
      className={`
        relative px-4 py-2 flex items-center gap-2 rounded-md
        ${isActive ? 'text-white bg-[#e40524]' : 'text-gray-600 hover:text-gray-900'}
      `}
    >
      {Icon && <Icon size={16} />}
      <span className="font-medium">{category.name}</span>
    </Link>
  )
} 