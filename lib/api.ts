import { Product, StoreAvailability } from '@/types'

export async function fetchStoreAvailability(productRef: string): Promise<StoreAvailability> {
  try {
    const response = await fetch(`https://phpstack-937973-4763176.cloudwaysapps.com/data1.php?type=search&query=${encodeURIComponent(productRef)}`);
    
    if (!response.ok) {
      console.warn(`HTTP error fetching stock for ${productRef}: ${response.status}`);
      // Return zero stock instead of throwing error
      return {
        'Stock Casa': 0,
        'Stock Rabat': 0,
        'Stock Marrakech': 0,
        'Stock Tanger': 0,
        'Stock Bouskoura': 0,
        'Stock Frimoda': 0,
      };
    }

    const data = await response.json();

    if (data.error) {
      console.warn(`API error for product ${productRef}:`, data.error);
      // Return zero stock instead of throwing error
      return {
        'Stock Casa': 0,
        'Stock Rabat': 0,
        'Stock Marrakech': 0,
        'Stock Tanger': 0,
        'Stock Bouskoura': 0,
        'Stock Frimoda': 0,
      };
    }

    // If no data found, return zero stock for all stores instead of throwing error
    if (data.length === 0) {
      console.log(`No availability data found for product ${productRef}, returning zero stock`);
      return {
        'Stock Casa': 0,
        'Stock Rabat': 0,
        'Stock Marrakech': 0,
        'Stock Tanger': 0,
        'Stock Bouskoura': 0,
        'Stock Frimoda': 0,
      };
    }

    return {
      'Stock Casa': parseInt(data[0]['Stock Casa'] || '0'),
      'Stock Rabat': parseInt(data[0]['Stock Rabat'] || '0'),
      'Stock Marrakech': parseInt(data[0]['Stock Marrakech'] || '0'),
      'Stock Tanger': parseInt(data[0]['Stock Tanger'] || '0'),
      'Stock Bouskoura': parseInt(data[0]['Stock Bouskoura'] || '0'),
      'Stock Frimoda': parseInt(data[0]['Stock Frimoda'] || '0'),
    };
  } catch (error) {
    console.error(`Error fetching stock for product ${productRef}:`, error);
    // Return zero stock instead of throwing error
    return {
      'Stock Casa': 0,
      'Stock Rabat': 0,
      'Stock Marrakech': 0,
      'Stock Tanger': 0,
      'Stock Bouskoura': 0,
      'Stock Frimoda': 0,
    };
  }
}

interface FetchProductsParams {
  category?: string;
  page?: number;
}

export async function fetchProducts({ category, page = 1 }: FetchProductsParams) {
  try {
    // Use the correct API endpoint for products from Prisma
    const url = category 
      ? `/api/products/category/${encodeURIComponent(category)}?page=${page}`
      : `/api/products?page=${page}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], hasMore: false };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const origin = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${origin}/api/products/articlesrouges`);
    
    if (!response.ok) throw new Error('Failed to fetch articles rouges');
    
    const { products }: { products: Product[] } = await response.json();
    
    if (!products || products.length === 0) {
      console.log('No articles rouges found')
      return null
    }

    // Find the product that matches the slug
    const product = products.find((product: Product) => {
      const productSlug = product.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zà-ÿ0-9-]/g, '')
      
      return productSlug === slug
    })

    if (!product) {
      console.log('No product found matching slug:', slug)
      return null
    }

    return product
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return null
  }
}

