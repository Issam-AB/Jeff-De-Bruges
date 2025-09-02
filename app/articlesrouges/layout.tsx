import Header from '@/components/Header'

export default function ArticleRougeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      {children}
    </>
  )
} 