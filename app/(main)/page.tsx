export const dynamic = 'force-dynamic'

import { getProducts } from '@/lib/products'
import ProductGrid from '@/components/ProductGrid'
import { Product } from '@/types'

interface HomeProps {
  searchParams?: {
    category?: string
  }
}

const normalizeSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
}

export default async function Home({ searchParams }: HomeProps) {
  const selectedCategory = searchParams?.category || 'tous'
  let products = await getProducts()
  
  if (selectedCategory !== 'tous') {
    products = products.filter(
      (p) => normalizeSlug(p.mainCategory || '') === selectedCategory
    )
  }
  
  return (
    <div className="space-y-8">
      <ProductGrid products={products as Product[]} />
    </div>
  )
}

