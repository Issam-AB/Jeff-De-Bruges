import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic' // Mark this route as dynamic

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json([])
    }

    const products = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { ref: { contains: query, mode: 'insensitive' } },
              { mainCategory: { contains: query, mode: 'insensitive' } },
              { subCategory: { contains: query, mode: 'insensitive' } }
            ]
          },
          { isActive: true }
        ]
      },
      select: {
        id: true,
        slug: true,
        name: true,
        ref: true,
        dimensions: true,
        mainCategory: true,
        subCategory: true,
        initialPrice: true,
        VenteflashPrice: true,
        mainImage: true,
        gallery: true,
        isActive: true,
      },
      take: 10
    })

    console.log('Search query:', query)
    console.log('Found products:', products.length)

    return NextResponse.json(products)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
} 