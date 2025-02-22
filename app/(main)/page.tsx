export const dynamic = 'force-dynamic'

import { getProducts } from '@/lib/products'
import ProductGrid from '@/components/ProductGrid'
import { Product } from '@/types'

export default async function Home() {
  const products = await getProducts()
  
  // Debug logs
  console.log('Total products:', products.length)
  console.log('Products with isArticleRouge:', products.filter(p => p.isArticleRouge))
  console.log('Active products:', products.filter(p => p.isActive))
  console.log('Article Rouge and Active:', products.filter(p => p.isArticleRouge && p.isActive))
  
  return (
    <div className="space-y-8">
      <ProductGrid products={products} />
    </div>
  )
}

