#!/usr/bin/env node
/**
 * Import only missing products
 */

import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
import {
  parseFilename,
  cleanProductName,
  extractSizeCode,
  extractPrice,
  generateRef,
  getDimensions,
  createSlug,
  validateFilename,
} from './lib/parser';
import { upsertProduct, getAllProductRefs } from './lib/db-utils';
import { ParsedProduct } from './types/product-import';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Finding and importing missing products...\n');

  const directory = './public/Photos avec prix';
  const files = fs.readdirSync(directory).filter(file => 
    /\.(jpeg|jpg|png)$/i.test(file)
  );

  console.log(`📁 Total files: ${files.length}`);

  // Get existing products
  const existingProducts = await prisma.product.findMany({
    select: { ref: true, slug: true, name: true }
  });
  const existingRefs = new Set(existingProducts.map(p => p.ref));
  const existingSlugs = new Set(existingProducts.map(p => p.slug));

  console.log(`💾 Existing products: ${existingProducts.length}\n`);

  // Group files
  const groups = new Map<string, string[]>();
  for (const filename of files) {
    const baseName = cleanProductName(filename);
    const sizeCode = extractSizeCode(filename);
    const price = extractPrice(filename);
    const key = `${baseName}_${sizeCode}_${price}`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(filename);
  }

  console.log(`📦 Product groups: ${groups.size}\n`);

  // Find missing products
  const missingProducts: ParsedProduct[] = [];
  let processed = 0;
  let skipped = 0;

  for (const [key, groupFiles] of groups.entries()) {
    const firstFile = groupFiles[0];
    const validation = validateFilename(firstFile);
    
    if (!validation.valid) {
      console.log(`⚠️  Skipping invalid: ${firstFile}`);
      skipped++;
      continue;
    }

    const metadata = parseFilename(firstFile);
    const ref = generateRef(
      metadata.mainCategory,
      metadata.brand,
      metadata.sizeCode,
      metadata.price,
      existingRefs
    );

    const slugBase = metadata.sizeCode 
      ? `${metadata.baseName} ${metadata.sizeCode}`.toLowerCase()
      : metadata.baseName;
    const slug = createSlug(slugBase);

    // Check if already exists
    if (existingRefs.has(ref) || existingSlugs.has(slug)) {
      processed++;
      continue;
    }

    // This is a missing product
    existingRefs.add(ref);
    const dimensions = getDimensions(metadata.sizeCode);
    const mainImage = `/Photos avec prix/${groupFiles[0]}`;
    const gallery = groupFiles.slice(1).map(file => `/Photos avec prix/${file}`);

    const sku = `JDB-${ref}`;
    const estimatedWeight: Record<string, number> = {
      'PM': 200, 'MM': 400, 'GM': 600, 'TGM': 1000,
    };
    const weight = metadata.sizeCode ? estimatedWeight[metadata.sizeCode] || null : null;
    
    const estimatedQuantity: Record<string, number> = {
      'PM': 12, 'MM': 24, 'GM': 36, 'TGM': 48,
    };
    const quantity = metadata.sizeCode ? estimatedQuantity[metadata.sizeCode] || null : null;

    const product: ParsedProduct = {
      name: metadata.baseName,
      ref,
      slug,
      mainImage,
      gallery,
      initialPrice: metadata.price || 0,
      dimensions,
      mainCategory: metadata.mainCategory,
      subCategory: metadata.subCategory,
      store: metadata.brand,
      isActive: true,
      sizeCode: metadata.sizeCode || undefined,
      rawFilename: firstFile,
      description: `Boîte de chocolats ${metadata.baseName.toLowerCase()}. ${metadata.isGiftBox ? 'Idéal pour offrir.' : ''}`,
      weight: weight,
      weightUnit: 'g',
      quantity: quantity,
      chocolateType: metadata.chocolateType || 'assortiment',
      ingredients: [],
      allergens: [],
      tags: metadata.tags || [],
      stock: 0,
      sku: sku,
      expirationDays: 180,
      isGiftBox: metadata.isGiftBox,
      isPremium: metadata.isPremium,
      brand: metadata.brand,
      material: metadata.material,
      shape: metadata.shape,
    };

    missingProducts.push(product);
    console.log(`➕ Missing: ${metadata.baseName} (${ref})`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Missing: ${missingProducts.length}\n`);

  if (missingProducts.length === 0) {
    console.log('✅ No missing products found!\n');
    await prisma.$disconnect();
    return;
  }

  // Import missing products
  console.log(`💾 Importing ${missingProducts.length} missing products...\n`);
  
  for (const product of missingProducts) {
    try {
      const result = await upsertProduct(prisma, product, false);
      console.log(`✓ ${result.action.toUpperCase()}: ${product.name} (${product.ref})`);
    } catch (error) {
      console.error(`✗ ERROR: ${product.name}:`, error);
    }
  }

  // Final count
  const finalCount = await prisma.product.count();
  console.log(`\n✅ Import complete!`);
  console.log(`📊 Total products in DB: ${finalCount}\n`);

  await prisma.$disconnect();
}

main().catch(console.error);

