#!/usr/bin/env node
/**
 * Direct comparison between files and database
 */

import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { groupFilesByProduct, cleanProductName, extractSizeCode, extractPrice, createSlug } from './lib/parser';

const prisma = new PrismaClient();

async function main() {
  const directory = './public/Photos avec prix';
  const files = fs.readdirSync(directory).filter(file => 
    /\.(jpeg|jpg|png)$/i.test(file)
  );

  // Group files
  const groups = groupFilesByProduct(files);
  
  // Get all DB products with their slugs
  const dbProducts = await prisma.product.findMany({
    select: { slug: true, ref: true, name: true }
  });

  console.log(`📁 Files: ${files.length}`);
  console.log(`📦 Product groups: ${groups.size}`);
  console.log(`💾 DB products: ${dbProducts.length}\n`);

  // Create slug for each file group and check
  const missing: Array<{ file: string; slug: string; name: string; ref?: string }> = [];
  const found: string[] = [];

  for (const [key, groupFiles] of Array.from(groups.entries())) {
    const firstFile = groupFiles[0];
    const baseName = cleanProductName(firstFile);
    const sizeCode = extractSizeCode(firstFile);
    
    const slugBase = sizeCode 
      ? `${baseName} ${sizeCode}`.toLowerCase()
      : baseName;
    const slug = createSlug(slugBase);

    // Check if exists in DB by slug
    const dbProduct = dbProducts.find(p => p.slug === slug);
    
    if (!dbProduct) {
      // Also check by name similarity
      const nameMatch = dbProducts.find(p => 
        p.name.toLowerCase() === baseName.toLowerCase() ||
        p.name.toLowerCase().includes(baseName.toLowerCase()) ||
        baseName.toLowerCase().includes(p.name.toLowerCase())
      );
      
      missing.push({
        file: firstFile,
        slug,
        name: baseName,
        ref: nameMatch?.ref
      });
    } else {
      found.push(slug);
    }
  }

  console.log(`\n📊 Analysis:`);
  console.log(`  Found in DB: ${found.length}`);
  console.log(`  Missing: ${missing.length}`);
  console.log(`  Total groups: ${groups.size}`);
  console.log(`  Expected: ${groups.size}`);
  console.log(`  Actual DB: ${dbProducts.length}`);
  console.log(`  Difference: ${groups.size - dbProducts.length}\n`);
  
  if (missing.length > 0) {
    console.log(`❌ Missing products (${missing.length}):\n`);
    missing.forEach(m => {
      console.log(`  📦 ${m.name}`);
      console.log(`     File: ${m.file}`);
      console.log(`     Slug: ${m.slug}`);
      if (m.ref) {
        console.log(`     ⚠️  Possible match by name: ${m.ref}`);
      }
      console.log('');
    });
  } else {
    console.log('✅ All product groups have corresponding DB entries!\n');
  }
  
  console.log(`📸 Note: ${files.length - groups.size} files are gallery images (multiple images per product)`);
  
  if (groups.size !== dbProducts.length) {
    console.log(`\n⚠️  WARNING: ${groups.size - dbProducts.length} products are missing from database!`);
    console.log(`   This might be due to duplicate REFs or slugs.\n`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);

