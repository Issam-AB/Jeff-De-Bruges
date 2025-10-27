import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Function to generate unique slug from name and ref
function generateSlug(name: string, ref: string): string {
  const slugBase = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
  
  const refSlug = ref
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  // Combine name + ref for unique slug
  return `${slugBase}-${refSlug}`.substring(0, 100)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const showInactive = searchParams.get('showInactive') === 'true'

    const products = await prisma.product.findMany({
      where: showInactive ? undefined : { isActive: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Generate unique slug from name and ref
    const slug = generateSlug(data.name, data.ref)

    // Create product using same structure as edit
    const product = await prisma.product.create({
      data: {
        name: data.name,
        ref: data.ref,
        dimensions: data.dimensions,
        mainCategory: data.mainCategory,
        subCategory: data.subCategory,
        initialPrice: Number(data.initialPrice),
        VenteflashPrice: Number(data.VenteflashPrice),
        mainImage: data.mainImage,
        gallery: data.gallery,
        isActive: data.isActive,
        slug: slug
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    
    // Regenerate slug if name or ref changed
    if (!data.slug || (data.name && data.ref)) {
      data.slug = generateSlug(data.name, data.ref)
    }

    const product = await prisma.product.update({
      where: { id: data.id },
      data: {
        ...data,
        gallery: Array.isArray(data.gallery) ? data.gallery : [],
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
} 