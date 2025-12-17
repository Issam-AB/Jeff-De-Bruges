import prisma from '@/lib/prisma'

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  parent?: string;
  featured?: boolean;
  order: number;
  children?: Category[];
}

// Create a type for the predefined categories
type PredefinedCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  featured: boolean;
  children?: Category[];
};

// Remove the 'as const' assertion and explicitly type the array
export const PREDEFINED_CATEGORIES: PredefinedCategory[] = [
  {
    id: 'tous',
    name: 'TOUS',
    slug: 'tous',
    icon: 'LayoutGrid',
    order: 0,
    featured: true
  },
  {
    id: 'chocolats',
    name: 'CHOCOLATS',
    slug: 'chocolats',
    icon: 'Candy',
    order: 1,
    featured: true,
    children: [
      {
        id: 'chocolats-noirs',
        name: 'Chocolats noirs',
        slug: 'chocolats-noirs',
        icon: 'Candy',
        order: 2
      },
      {
        id: 'chocolats-au-lait',
        name: 'Chocolats au lait',
        slug: 'chocolats-au-lait',
        icon: 'Candy',
        order: 3
      },
      {
        id: 'chocolats-blancs',
        name: 'Chocolats blancs',
        slug: 'chocolats-blancs',
        icon: 'Candy',
        order: 4
      }
    ]
  },
  {
    id: 'pralines',
    name: 'PRALINÉS',
    slug: 'pralines',
    icon: 'Heart',
    order: 5,
    featured: true,
    children: [
      {
        id: 'pralines-classiques',
        name: 'Pralinés classiques',
        slug: 'pralines-classiques',
        icon: 'Heart',
        order: 6
      },
      {
        id: 'pralines-speciales',
        name: 'Pralinés spéciaux',
        slug: 'pralines-speciales',
        icon: 'Heart',
        order: 7
      }
    ]
  },
  {
    id: 'truffes',
    name: 'TRUFFES',
    slug: 'truffes',
    icon: 'Sparkles',
    order: 8,
    featured: true,
    children: [
      {
        id: 'truffes-classiques',
        name: 'Truffes classiques',
        slug: 'truffes-classiques',
        icon: 'Sparkles',
        order: 9
      },
      {
        id: 'truffes-aromatisees',
        name: 'Truffes aromatisées',
        slug: 'truffes-aromatisees',
        icon: 'Sparkles',
        order: 10
      }
    ]
  },
  {
    id: 'tablettes',
    name: 'TABLETTES',
    slug: 'tablettes',
    icon: 'Box',
    order: 11,
    featured: true,
    children: [
      {
        id: 'tablettes-noires',
        name: 'Tablettes noires',
        slug: 'tablettes-noires',
        icon: 'Box',
        order: 12
      },
      {
        id: 'tablettes-au-lait',
        name: 'Tablettes au lait',
        slug: 'tablettes-au-lait',
        icon: 'Box',
        order: 13
      },
      {
        id: 'tablettes-blanches',
        name: 'Tablettes blanches',
        slug: 'tablettes-blanches',
        icon: 'Box',
        order: 14
      }
    ]
  },
  {
    id: 'boites-cadeaux',
    name: 'BOÎTES CADEAUX',
    slug: 'boites-cadeaux',
    icon: 'Gift',
    order: 15,
    featured: true,
    children: [
      {
        id: 'petites-boites',
        name: 'Petites boîtes',
        slug: 'petites-boites',
        icon: 'Gift',
        order: 16
      },
      {
        id: 'grandes-boites',
        name: 'Grandes boîtes',
        slug: 'grandes-boites',
        icon: 'Gift',
        order: 17
      },
      {
        id: 'boites-premium',
        name: 'Boîtes premium',
        slug: 'boites-premium',
        icon: 'Gift',
        order: 18
      }
    ]
  },
  {
    id: 'chocolats-de-noel',
    name: 'CHOCOLATS DE NOËL',
    slug: 'chocolats-de-noel',
    icon: 'Star',
    order: 19,
    featured: true,
    children: [
      {
        id: 'calendriers',
        name: 'Calendriers',
        slug: 'calendriers',
        icon: 'Star',
        order: 20
      },
      {
        id: 'peres-noel',
        name: 'Pères Noël',
        slug: 'peres-noel',
        icon: 'Star',
        order: 21
      },
      {
        id: 'assortiments-noel',
        name: 'Assortiments',
        slug: 'assortiments-noel',
        icon: 'Star',
        order: 22
      }
    ]
  },
  {
    id: 'chocolats-de-paques',
    name: 'CHOCOLATS DE PÂQUES',
    slug: 'chocolats-de-paques',
    icon: 'Package',
    order: 23,
    featured: true,
    children: [
      {
        id: 'oeufs',
        name: 'Œufs',
        slug: 'oeufs',
        icon: 'Package',
        order: 24
      },
      {
        id: 'lapins',
        name: 'Lapins',
        slug: 'lapins',
        icon: 'Package',
        order: 25
      },
      {
        id: 'assortiments-paques',
        name: 'Assortiments',
        slug: 'assortiments-paques',
        icon: 'Package',
        order: 26
      }
    ]
  }
];

// Update the flattening logic with proper typing
const FLATTENED_CATEGORIES: Category[] = PREDEFINED_CATEGORIES.reduce<Category[]>((acc, category) => {
  // Add the current category
  acc.push(category as Category);
  
  // Add children if they exist
  if ('children' in category && Array.isArray(category.children)) {
    acc.push(...category.children);
  }
  
  return acc;
}, []);

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')     // Replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, '')         // Remove leading/trailing dashes
}

// Function to get all unique categories from the database
export async function getDBCategories() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true
    },
    select: {
      mainCategory: true,
      subCategory: true
    }
  })

  const categories = new Set<string>()
  
  // Add "Tous" category first with proper casing
  categories.add('tous')
  
  products.forEach(product => {
    if (product.mainCategory) categories.add(product.mainCategory)
    if (product.subCategory) categories.add(product.subCategory)
  })

  return Array.from(categories).map(category => ({
    id: normalizeString(category),
    name: category,
    slug: normalizeString(category),
    icon: getIconForCategory(category),
    order: getOrderForCategory(category),
    featured: true
  }))
}

// Helper function to format category names
function formatCategoryName(category: string): string {
  if (category === 'tous') return 'Tous les produits'
  return category.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ')
}

function getIconForCategory(category: string): string {
  const categoryLower = category.toLowerCase()
  if (categoryLower === 'tous') return 'LayoutGrid'
  if (categoryLower.includes('chocolat')) return 'Candy'
  if (categoryLower.includes('praliné') || categoryLower.includes('praline')) return 'Heart'
  if (categoryLower.includes('truffe')) return 'Sparkles'
  if (categoryLower.includes('tablette')) return 'Box'
  if (categoryLower.includes('boîte') || categoryLower.includes('boite') || categoryLower.includes('cadeau')) return 'Gift'
  if (categoryLower.includes('noël') || categoryLower.includes('noel')) return 'Star'
  if (categoryLower.includes('pâques') || categoryLower.includes('paques')) return 'Package'
  return 'Candy' // default icon
}

function getOrderForCategory(category: string): number {
  const categoryLower = category.toLowerCase()
  if (categoryLower === 'tous') return 0
  if (categoryLower.includes('chocolat') && !categoryLower.includes('noël') && !categoryLower.includes('pâques')) return 1
  if (categoryLower.includes('praliné') || categoryLower.includes('praline')) return 5
  if (categoryLower.includes('truffe')) return 8
  if (categoryLower.includes('tablette')) return 11
  if (categoryLower.includes('boîte') || categoryLower.includes('boite') || categoryLower.includes('cadeau')) return 15
  if (categoryLower.includes('noël') || categoryLower.includes('noel')) return 19
  if (categoryLower.includes('pâques') || categoryLower.includes('paques')) return 23
  return 99 // default order
}

export async function getCategoryBySlug(slug: string) {
  const normalizedSlug = normalizeString(slug)
  return FLATTENED_CATEGORIES.find(cat => normalizeString(cat.slug) === normalizedSlug)
}

export async function getParentCategories(): Promise<Category[]> {
  return PREDEFINED_CATEGORIES.filter(cat => !('parent' in cat)) as Category[];
}

export async function getChildCategories(parentId: string): Promise<Category[]> {
  const parent = PREDEFINED_CATEGORIES.find(cat => cat.id === parentId);
  return (parent && 'children' in parent) ? parent.children || [] : [];
}

export async function getAllCategories(): Promise<Category[]> {
  return FLATTENED_CATEGORIES;
}

export async function getFeaturedCategories(): Promise<Category[]> {
  return FLATTENED_CATEGORIES.filter(cat => cat.featured);
}
