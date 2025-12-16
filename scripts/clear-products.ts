#!/usr/bin/env node
/**
 * Clear all products from database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing all products from database...\n');

  try {
    // Delete all gallery images first (foreign key constraint)
    const galleryCount = await prisma.gallery.deleteMany({});
    console.log(`✓ Deleted ${galleryCount.count} gallery images`);

    // Delete all products
    const productCount = await prisma.product.deleteMany({});
    console.log(`✓ Deleted ${productCount.count} products`);

    // Delete all categories
    const categoryCount = await prisma.category.deleteMany({});
    console.log(`✓ Deleted ${categoryCount.count} categories`);

    console.log('\n✅ Database cleared successfully!\n');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

