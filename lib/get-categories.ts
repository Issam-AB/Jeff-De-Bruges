import { prisma } from './prisma'

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })

    // If no categories in DB, return default categories
    if (categories.length === 0) {
      return [
        { name: 'Tous', slug: 'tous', count: 0 },
        { name: 'Coupes', slug: 'coupes', count: 0 },
        { name: 'Plateaux', slug: 'plateaux', count: 0 },
        { name: 'Pots', slug: 'pots', count: 0 },
        { name: 'Coffrets', slug: 'coffrets', count: 0 },
        { name: 'Accessoires', slug: 'accessoires', count: 0 },
        { name: 'Bols', slug: 'bols', count: 0 },
      ]
    }

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await prisma.product.count({
          where: {
            mainCategory: cat.name,
            isActive: true
          }
        })
        // Create slug that matches the route format
        const slug = cat.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
          .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        
        return {
          name: cat.name,
          slug,
          count
        }
      })
    )

    // Add "Tous" at the beginning
    const totalCount = await prisma.product.count({
      where: { isActive: true }
    })

    return [
      { name: 'Tous', slug: 'tous', count: totalCount },
      ...categoriesWithCounts.filter(cat => cat.count > 0)
    ]
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

