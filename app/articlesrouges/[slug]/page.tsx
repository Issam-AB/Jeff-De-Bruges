import { notFound } from 'next/navigation'
import ArticleRougePage from '@/components/ArticleRougePage'
import { getArticleRougeBySlug } from '@/lib/articleRougeApi'
import { Loader2 } from 'lucide-react'
import { Suspense } from 'react'

interface PageProps {
  params: {
    slug: string
  }
}

export default async function Page({ params }: PageProps) {
  const product = await getArticleRougeBySlug(params.slug)
  
  if (!product) {
    notFound()
  }

  return (
    <main className="flex-1">
      <Suspense fallback={<Loading />}>
        <ArticleRougePage product={product} />
      </Suspense>
    </main>
  )
}

// Loading state
function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
        <span className="text-gray-900">Chargement du produit...</span>
      </div>
    </div>
  )
}

// Not found state
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Produit non trouvé
        </h1>
        <p className="text-gray-600">
          Le produit que vous recherchez n'existe pas ou n'est plus disponible.
        </p>
      </div>
    </div>
  )
} 