import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Check database connection
    if (!prisma) {
      throw new Error('Database connection not available')
    }
    
    const data = await request.json()
    console.log('Creating product with data:', data)
    
    // Generate slug from name if not provided
    const slug = data.slug || data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .substring(0, 100) // Limit length
    
    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        isActive: true,
      }
    })

    console.log('Product created successfully:', product.id)
    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Failed to create product:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: error?.code
    })
    
    // Handle specific Prisma errors
    if (error?.code === 'P2002') {
      const field = error?.meta?.target?.[0] || 'field'
      return NextResponse.json(
        { 
          error: `Ce ${field === 'ref' ? 'numéro de référence' : field === 'slug' ? 'nom de produit' : field} existe déjà`,
          details: `Un produit avec ce ${field} existe déjà dans la base de données`
        },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Check database connection
    if (!prisma) {
      throw new Error('Database connection not available')
    }
    
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const category = searchParams.get('category')
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '12')

    const products = await prisma.product.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
        ...(category ? {
          OR: [
            { mainCategory: category },
            { subCategory: category }
          ]
        } : {})
      },
      orderBy: [
        { isTopProduct: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take,
    })

    console.log('API: Fetched products:', {
      category,
      count: products.length,
      activeOnly,
      skip,
      take
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Check database connection
    if (!prisma) {
      throw new Error('Database connection not available')
    }
    
    const { id, ...data } = await request.json()
    console.log('Updating product:', id, 'with data:', data)
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
      }
    })

    console.log('Product updated successfully:', product.id)
    return NextResponse.json(product)
  } catch (error: any) {
    console.error('Failed to update product:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: error?.code
    })
    
    // Handle specific Prisma errors
    if (error?.code === 'P2002') {
      const field = error?.meta?.target?.[0] || 'field'
      return NextResponse.json(
        { 
          error: `Ce ${field === 'ref' ? 'numéro de référence' : field === 'slug' ? 'nom de produit' : field} existe déjà`,
          details: `Un produit avec ce ${field} existe déjà dans la base de données`
        },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    // Check database connection
    if (!prisma) {
      throw new Error('Database connection not available')
    }
    
    const { id } = await request.json()
    await prisma.product.delete({ where: { id } })
    return new Response('OK')
  } catch (error) {
    console.error('Error deleting product:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json(
      { 
        error: 'Failed to delete product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 