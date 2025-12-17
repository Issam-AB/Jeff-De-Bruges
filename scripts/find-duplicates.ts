#!/usr/bin/env node
/**
 * Find duplicate REFs or slugs in database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, ref: true, slug: true, name: true }
  });

  console.log(`📊 Total products: ${products.length}\n`);

  // Check for duplicate REFs
  const refMap = new Map<string, number>();
  products.forEach(p => {
    refMap.set(p.ref, (refMap.get(p.ref) || 0) + 1);
  });

  const duplicateRefs = Array.from(refMap.entries())
    .filter(([ref, count]) => count > 1);

  if (duplicateRefs.length > 0) {
    console.log(`❌ Duplicate REFs (${duplicateRefs.length}):\n`);
    duplicateRefs.forEach(([ref, count]) => {
      const productsWithRef = products.filter(p => p.ref === ref);
      console.log(`  REF: ${ref} (${count} times)`);
      productsWithRef.forEach(p => {
        console.log(`    - ${p.name} (${p.slug})`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No duplicate REFs\n');
  }

  // Check for duplicate slugs
  const slugMap = new Map<string, number>();
  products.forEach(p => {
    slugMap.set(p.slug, (slugMap.get(p.slug) || 0) + 1);
  });

  const duplicateSlugs = Array.from(slugMap.entries())
    .filter(([slug, count]) => count > 1);

  if (duplicateSlugs.length > 0) {
    console.log(`❌ Duplicate Slugs (${duplicateSlugs.length}):\n`);
    duplicateSlugs.forEach(([slug, count]) => {
      const productsWithSlug = products.filter(p => p.slug === slug);
      console.log(`  Slug: ${slug} (${count} times)`);
      productsWithSlug.forEach(p => {
        console.log(`    - ${p.name} (${p.ref})`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No duplicate slugs\n');
  }

  // Summary
  const uniqueRefs = new Set(products.map(p => p.ref)).size;
  const uniqueSlugs = new Set(products.map(p => p.slug)).size;

  console.log('📊 Summary:');
  console.log(`  Total products: ${products.length}`);
  console.log(`  Unique REFs: ${uniqueRefs}`);
  console.log(`  Unique slugs: ${uniqueSlugs}`);
  console.log(`  Missing: ${172 - products.length} products\n`);

  await prisma.$disconnect();
}

main().catch(console.error);

