/**
 * Database utilities for product import
 */

import { PrismaClient, Product, Category, Prisma } from '@prisma/client';
import { ParsedProduct } from '../types/product-import';

// Type for Prisma transaction client
type PrismaTransaction = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * Get or create category with subcategory
 */
export async function ensureCategory(
  prisma: PrismaClient | PrismaTransaction,
  categoryName: string,
  subCategory: string
): Promise<Category> {
  // Try to find existing category
  let category = await prisma.category.findUnique({
    where: { name: categoryName },
  });

  if (category) {
    // Check if subcategory exists
    if (!category.subcategories.includes(subCategory)) {
      // Add new subcategory
      category = await prisma.category.update({
        where: { id: category.id },
        data: {
          subcategories: {
            push: subCategory,
          },
        },
      });
    }
  } else {
    // Create new category with subcategory
    category = await prisma.category.create({
      data: {
        name: categoryName,
        subcategories: [subCategory],
      },
    });
  }

  return category;
}

/**
 * Check if product exists by ref or slug
 */
export async function findExistingProduct(
  prisma: PrismaClient | PrismaTransaction,
  ref: string,
  slug: string
): Promise<Product | null> {
  // Try to find by ref first
  let product = await prisma.product.findUnique({
    where: { ref },
  });

  if (!product) {
    // Try to find by slug
    product = await prisma.product.findUnique({
      where: { slug },
    });
  }

  return product;
}

/**
 * Create product with gallery images
 */
export async function createProduct(
  prisma: PrismaClient | PrismaTransaction,
  productData: ParsedProduct
): Promise<Product> {
  // Extract fields that are not in Prisma schema
  const { gallery, sizeCode, rawFilename, ...mainData } = productData;

  const product = await prisma.product.create({
    data: {
      ...mainData,
      // Ensure arrays are not undefined
      ingredients: mainData.ingredients || [],
      allergens: mainData.allergens || [],
      tags: mainData.tags || [],
      Gallery: {
        create: gallery.map(url => ({ url })),
      },
    },
    include: {
      Gallery: true,
    },
  });

  return product;
}

/**
 * Update existing product
 */
export async function updateProduct(
  prisma: PrismaClient | PrismaTransaction,
  productId: string,
  productData: ParsedProduct
): Promise<Product> {
  // Extract fields that are not in Prisma schema
  const { gallery, sizeCode, rawFilename, ...mainData } = productData;

  // Delete existing gallery images
  await prisma.gallery.deleteMany({
    where: { productId },
  });

  // Update product and create new gallery
  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...mainData,
      // Ensure arrays are not undefined
      ingredients: mainData.ingredients || [],
      allergens: mainData.allergens || [],
      tags: mainData.tags || [],
      Gallery: {
        create: gallery.map(url => ({ url })),
      },
    },
    include: {
      Gallery: true,
    },
  });

  return product;
}

/**
 * Get all existing product refs
 */
export async function getAllProductRefs(prisma: PrismaClient): Promise<Set<string>> {
  const products = await prisma.product.findMany({
    select: { ref: true },
  });

  return new Set(products.map(p => p.ref));
}

/**
 * Get all existing product slugs
 */
export async function getAllProductSlugs(prisma: PrismaClient): Promise<Set<string>> {
  const products = await prisma.product.findMany({
    select: { slug: true },
  });

  return new Set(products.map(p => p.slug));
}

/**
 * Create or update product in a transaction
 */
export async function upsertProduct(
  prisma: PrismaClient,
  productData: ParsedProduct,
  updateExisting: boolean = false
): Promise<{ product: Product; action: 'created' | 'updated' | 'skipped' }> {
  return await prisma.$transaction(async (tx) => {
    // Ensure category exists
    await ensureCategory(tx, productData.mainCategory, productData.subCategory);

    // Check if product exists
    const existing = await findExistingProduct(tx, productData.ref, productData.slug);

    if (existing) {
      if (updateExisting) {
        const updated = await updateProduct(tx, existing.id, productData);
        return { product: updated, action: 'updated' };
      } else {
        return { product: existing, action: 'skipped' };
      }
    }

    // Create new product
    const created = await createProduct(tx, productData);
    return { product: created, action: 'created' };
  });
}

/**
 * Batch create products
 */
export async function batchCreateProducts(
  prisma: PrismaClient,
  products: ParsedProduct[],
  updateExisting: boolean = false
): Promise<
  Array<{ product: Product; action: 'created' | 'updated' | 'skipped'; error?: string }>
> {
  const results: Array<{
    product: Product | null;
    action: 'created' | 'updated' | 'skipped' | 'error';
    error?: string;
  }> = [];

  for (const productData of products) {
    try {
      const result = await upsertProduct(prisma, productData, updateExisting);
      results.push(result);
    } catch (error) {
      results.push({
        product: null,
        action: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results.filter(r => r.product !== null) as Array<{
    product: Product;
    action: 'created' | 'updated' | 'skipped';
    error?: string;
  }>;
}

/**
 * Get product statistics
 */
export async function getProductStats(prisma: PrismaClient) {
  const [total, byCategory, byStore] = await Promise.all([
    prisma.product.count(),
    prisma.product.groupBy({
      by: ['mainCategory'],
      _count: true,
    }),
    prisma.product.groupBy({
      by: ['store'],
      _count: true,
      where: {
        store: { not: null },
      },
    }),
  ]);

  return {
    total,
    byCategory: byCategory.map(c => ({ category: c.mainCategory, count: c._count })),
    byStore: byStore.map(s => ({ store: s.store, count: s._count })),
  };
}

/**
 * Validate product data before insertion
 */
export function validateProductData(product: ParsedProduct): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!product.name || product.name.length < 3) {
    errors.push('Product name is too short');
  }

  if (!product.ref) {
    errors.push('Product reference is missing');
  }

  if (!product.slug) {
    errors.push('Product slug is missing');
  }

  if (!product.mainImage) {
    errors.push('Main image is missing');
  }

  if (!product.initialPrice || product.initialPrice <= 0) {
    errors.push('Invalid price');
  }

  if (!product.mainCategory) {
    errors.push('Main category is missing');
  }

  if (!product.subCategory) {
    errors.push('Sub category is missing');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

