import { notFound } from 'next/navigation'
import ArticleRougePage from '@/components/ArticleRougePage'
import { getArticleRougeBySlug } from '@/lib/articleRougeApi'

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

  return <ArticleRougePage product={product} />
} 