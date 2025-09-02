import { Product } from '@/types'
import ProductCard from './ProductCard'
import ArticleRougeSection from './ArticleRougeSection'

interface CategoryProductGridProps {
  products: Product[]
}

export default function CategoryProductGrid({ products }: CategoryProductGridProps) {
  // Find Article Rouge product for this category and transform data
  const articleRougeProduct = products.find(p => p.isArticleRouge && p.isActive)
  
  // Transform the article rouge product if it exists
  const transformedArticleRougeProduct = articleRougeProduct ? {
    ...articleRougeProduct,
    isArticleRouge: articleRougeProduct.isArticleRouge ?? false,
    articleRougePrice: articleRougeProduct.articleRougePrice ?? null,
    store: articleRougeProduct.store ?? null,
    VenteflashPrice: articleRougeProduct.VenteflashPrice
  } : null
  
  // Filter out Article Rouge product from main grid
  const regularProducts = products.filter(p => !p.isArticleRouge)

  return (
    <div>
      {/* Article Rouge Section */}
      {transformedArticleRougeProduct && (
        <ArticleRougeSection products={[transformedArticleRougeProduct]} />
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