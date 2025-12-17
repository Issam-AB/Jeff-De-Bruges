#!/usr/bin/env node
/**
 * Find missing products - compare files with database
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { parseFilename, cleanProductName, extractSizeCode, extractPrice } from './lib/parser';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Finding missing products...\n');

  // Read all files
  const directory = './public/Photos avec prix';
  const files = fs.readdirSync(directory).filter(file => 
    /\.(jpeg|jpg|png)$/i.test(file)
  );

  console.log(`📁 Total files: ${files.length}\n`);

  // Get all products from DB
  const dbProducts = await prisma.product.findMany({
    select: { ref: true, slug: true, name: true }
  });

  console.log(`💾 Products in DB: ${dbProducts.length}\n`);

  // Process each file
  const processedFiles: Set<string> = new Set();
  const missingFiles: string[] = [];
  const errorFiles: Array<{ file: string; error: string }> = [];

  for (const file of files) {
    try {
      const metadata = parseFilename(file);
      const baseName = cleanProductName(file);
      const sizeCode = extractSizeCode(file);
      const price = extractPrice(file);

      // Create slug like in import script
      const slugBase = sizeCode 
        ? `${baseName} ${sizeCode}`.toLowerCase()
        : baseName;
      const slug = slugBase
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-+/g, '-');

      // Check if product exists
      const exists = dbProducts.some(p => 
        p.slug === slug || 
        p.name.toLowerCase() === baseName.toLowerCase()
      );

      if (!exists) {
        missingFiles.push(file);
        console.log(`❌ Missing: ${file}`);
        console.log(`   Name: ${baseName}`);
        console.log(`   Slug: ${slug}`);
        console.log(`   Size: ${sizeCode || 'N/A'}`);
        console.log(`   Price: ${price || 'N/A'} MAD\n`);
      } else {
        processedFiles.add(file);
      }
    } catch (error) {
      errorFiles.push({
        file,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error(`⚠️  Error processing ${file}:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files: ${files.length}`);
  console.log(`Processed (in DB): ${processedFiles.size}`);
  console.log(`Missing: ${missingFiles.length}`);
  console.log(`Errors: ${errorFiles.length}`);
  console.log(`\nMissing files:\n${missingFiles.map(f => `  - ${f}`).join('\n')}`);

  if (errorFiles.length > 0) {
    console.log(`\nError files:\n${errorFiles.map(e => `  - ${e.file}: ${e.error}`).join('\n')}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);

