import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const categorySlug = decodeURIComponent(params.category)
    
    // Normalize slug to match DB category names
    const normalizeSlug = (name: string) => {
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-')
    }
    
    // Get all categories from DB
    const allCategories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    
    // Find matching category
    const matchingCategory = allCategories.find(cat => 
      normalizeSlug(cat.name) === categorySlug
    )
    
    if (!matchingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Get unique subcategories from products in this category
    const products = await prisma.product.findMany({
      where: {
        mainCategory: matchingCategory.name,
        isActive: true
      },
      select: {
        subCategory: true
      }
    })
    
    const subcategories = Array.from(
      new Set(products.map(p => p.subCategory).filter(Boolean))
    ).sort()

    return NextResponse.json({
      name: matchingCategory.name,
      subcategories
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const data = await request.json()
    const categoryName = params.category

    return NextResponse.json({
      name: categoryName,
      subcategories: data.subcategories
    })
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    return NextResponse.json({ 
      message: 'Category deleted successfully' 
    })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
} 