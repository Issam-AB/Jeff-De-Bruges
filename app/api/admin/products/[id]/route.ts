import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    
    // Debug log
    console.log('Received update data:', data)

    const product = await prisma.product.update({
      where: {
        id: params.id,
      },
      data: {
        ref: data.ref,
        name: data.name,
        slug: data.slug,
        dimensions: data.dimensions,
        mainCategory: data.mainCategory,
        subCategory: data.subCategory,
        initialPrice: data.initialPrice,
        VenteflashPrice: data.VenteflashPrice,
        mainImage: data.mainImage,
        gallery: data.gallery,
        isActive: data.isActive,
        // Add Article Rouge fields
        isArticleRouge: data.isArticleRouge,
        articleRougePrice: data.articleRougePrice,
        store: data.store,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json(
      { message: 'Error updating product', error },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
} 