#!/usr/bin/env node
/**
 * Check categories and product names in database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database...\n');

  // Get all categories
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  console.log('📂 CATEGORIES IN DATABASE:');
  console.log('='.repeat(60));
  categories.forEach(cat => {
    console.log(`\n${cat.name}:`);
    console.log(`  Subcategories: ${cat.subcategories.join(', ') || 'None'}`);
  });

  // Get products grouped by category
  const products = await prisma.product.findMany({
    select: {
      mainCategory: true,
      subCategory: true,
      name: true,
      ref: true,
    },
    orderBy: [
      { mainCategory: 'asc' },
      { name: 'asc' }
    ]
  });

  console.log('\n\n📦 PRODUCTS BY CATEGORY:');
  console.log('='.repeat(60));

  const byCategory = new Map<string, { count: number; products: string[] }>();

  products.forEach(p => {
    if (!byCategory.has(p.mainCategory)) {
      byCategory.set(p.mainCategory, { count: 0, products: [] });
    }
    const cat = byCategory.get(p.mainCategory)!;
    cat.count++;
    if (cat.products.length < 5) {
      cat.products.push(p.name);
    }
  });

  byCategory.forEach((data, category) => {
    console.log(`\n${category} (${data.count} products):`);
    data.products.forEach(name => console.log(`  - ${name}`));
    if (data.count > 5) {
      console.log(`  ... and ${data.count - 5} more`);
    }
  });

  // Get unique categories
  const uniqueCategories = Array.from(byCategory.keys()).sort();
  console.log('\n\n📋 UNIQUE CATEGORIES:');
  console.log('='.repeat(60));
  uniqueCategories.forEach((cat, idx) => {
    console.log(`${idx + 1}. ${cat} (${byCategory.get(cat)!.count} products)`);
  });

  // Sample product names
  console.log('\n\n📝 SAMPLE PRODUCT NAMES:');
  console.log('='.repeat(60));
  products.slice(0, 20).forEach(p => {
    console.log(`- ${p.name} [${p.mainCategory}]`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);

