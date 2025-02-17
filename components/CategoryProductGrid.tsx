import { Product } from '@/lib/types'
import ProductCard from './ProductCard'
import ArticleRougeSection from './ArticleRougeSection'

interface CategoryProductGridProps {
  products: Product[]
}

export default function CategoryProductGrid({ products }: CategoryProductGridProps) {
  // Find Article Rouge product for this category
  const articleRougeProduct = products.find(p => p.isArticleRouge && p.isActive)
  
  // Filter out Article Rouge product from main grid
  const regularProducts = products.filter(p => !p.isArticleRouge)

  return (
    <div>
      {/* Article Rouge Section */}
      {articleRougeProduct && (
        <ArticleRougeSection products={[articleRougeProduct]} />
      )}

      {/* Regular Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {regularProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
} 