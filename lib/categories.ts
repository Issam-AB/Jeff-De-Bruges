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
    id: 'salons',
    name: 'SALONS',
    slug: 'salons',
    icon: 'Sofa',
    order: 1,
    featured: true,
    children: [
      {
        id: 'salon-en-l',
        name: 'Salon en L',
        slug: 'salon-en-l',
        icon: 'Sofa',
        order: 2
      },
      {
        id: 'salon-en-u',
        name: 'Salon en U',
        slug: 'salon-en-u',
        icon: 'Sofa',
        order: 3
      }
    ]
  },
  {
    id: 'canapes',
    name: 'CANAPÉS',
    slug: 'canapes',
    icon: 'Armchair',
    order: 4,
    featured: true,
    children: [
      {
        id: 'canape-2-places',
        name: 'Canapé 2 Places',
        slug: 'canape-2-places',
        icon: 'Armchair',
        order: 5
      },
      {
        id: 'canape-3-places',
        name: 'Canapé 3 Places',
        slug: 'canape-3-places',
        icon: 'Armchair',
        order: 6
      },
      {
        id: 'fauteuils',
        name: 'Fauteuils',
        slug: 'fauteuils',
        icon: 'Armchair',
        order: 7
      }
    ]
  },
  {
    id: 'chambre',
    name: 'CHAMBRE',
    slug: 'chambre',
    icon: 'Bed',
    order: 8,
    featured: true,
    children: [
      {
        id: 'lits',
        name: 'Lits',
        slug: 'lits',
        icon: 'Bed',
        order: 9
      },
      {
        id: 'matelas',
        name: 'Matelas',
        slug: 'matelas',
        icon: 'Package',
        order: 10
      },
      {
        id: 'table-de-chevet',
        name: 'Table de Chevet',
        slug: 'table-de-chevet',
        icon: 'Table2',
        order: 11
      }
    ]
  },
  {
    id: 'tables',
    name: 'TABLES',
    slug: 'tables',
    icon: 'Table2',
    order: 12,
    featured: true,
    children: [
      {
        id: 'table-basse',
        name: 'Table Basse',
        slug: 'table-basse',
        icon: 'Table2',
        order: 13
      },
      {
        id: 'table-salle-manger',
        name: 'Table de Salle à Manger',
        slug: 'table-salle-manger',
        icon: 'Table2',
        order: 14
      },
      {
        id: 'table-appoint',
        name: "Table D'appoint",
        slug: 'table-appoint',
        icon: 'Table2',
        order: 15
      }
    ]
  },
  {
    id: 'chaises',
    name: 'CHAISES',
    slug: 'chaises',
    icon: 'Chair',
    order: 16,
    featured: true,
    children: [
      {
        id: 'chaises-salle',
        name: 'Chaises',
        slug: 'chaises-salle',
        icon: 'Chair',
        order: 17
      }
    ]
  },
  {
    id: 'jardin',
    name: 'JARDIN',
    slug: 'jardin',
    icon: 'Palmtree',
    order: 18,
    featured: true,
    children: [
      {
        id: 'ensemble-exterieur',
        name: "Ensemble D'extérieur",
        slug: 'ensemble-exterieur',
        icon: 'Palmtree',
        order: 19
      },
      {
        id: 'salle-manger-chaises',
        name: 'Salle à Manger + Chaises',
        slug: 'salle-manger-chaises',
        icon: 'Palmtree',
        order: 20
      }
    ]
  },
  {
    id: 'meubles',
    name: 'MEUBLES',
    slug: 'meubles',
    icon: 'Package',
    order: 21,
    featured: true,
    children: [
      {
        id: 'consoles',
        name: 'Consoles',
        slug: 'consoles',
        icon: 'Package',
        order: 22
      },
      {
        id: 'armoires',
        name: 'Armoires',
        slug: 'armoires',
        icon: 'Door',
        order: 23
      },
      {
        id: 'bibliotheques',
        name: 'Bibliothèques',
        slug: 'bibliotheques',
        icon: 'Library',
        order: 24
      },
      {
        id: 'buffets',
        name: 'Buffets',
        slug: 'buffets',
        icon: 'Package',
        order: 25
      },
      {
        id: 'meubles-tv',
        name: 'Meubles TV',
        slug: 'meubles-tv',
        icon: 'Tv',
        order: 26
      }
    ]
  },
  {
    id: 'deco',
    name: 'DECO',
    slug: 'deco',
    icon: 'Sparkles',
    order: 27,
    featured: true,
    children: [
      {
        id: 'mirroirs',
        name: 'Mirroirs',
        slug: 'mirroirs',
        icon: 'Frame',
        order: 28
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
  if (categoryLower.includes('salon')) return 'Sofa'
  if (categoryLower.includes('chambre')) return 'Bed'
  if (categoryLower.includes('table')) return 'Table2'
  if (categoryLower.includes('armoire')) return 'Door'
  return 'Package' // default icon
}

function getOrderForCategory(category: string): number {
  const categoryLower = category.toLowerCase()
  if (categoryLower === 'tous') return 0
  if (categoryLower.includes('salon')) return 1
  if (categoryLower.includes('chambre')) return 2
  if (categoryLower.includes('table')) return 3
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
