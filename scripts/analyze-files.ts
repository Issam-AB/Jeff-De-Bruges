#!/usr/bin/env node
/**
 * Analyze files to find duplicates and gallery images
 */

import * as fs from 'fs';
import { groupFilesByProduct, cleanProductName, extractSizeCode, extractPrice } from './lib/parser';

const directory = './public/Photos avec prix';
const files = fs.readdirSync(directory).filter(file => 
  /\.(jpeg|jpg|png)$/i.test(file)
);

console.log(`📁 Total files: ${files.length}\n`);

// Group files by product
const groups = groupFilesByProduct(files);

console.log(`📦 Product groups: ${groups.size}\n`);

// Find products with multiple images
let totalFilesInGroups = 0;
let productsWithMultipleImages = 0;
const singleImageProducts: string[] = [];
const multiImageProducts: Array<{ name: string; count: number; files: string[] }> = [];

for (const [key, groupFiles] of groups.entries()) {
  totalFilesInGroups += groupFiles.length;
  
  if (groupFiles.length > 1) {
    productsWithMultipleImages++;
    const baseName = cleanProductName(groupFiles[0]);
    multiImageProducts.push({
      name: baseName,
      count: groupFiles.length,
      files: groupFiles
    });
  } else {
    singleImageProducts.push(groupFiles[0]);
  }
}

console.log('='.repeat(60));
console.log('📊 ANALYSIS');
console.log('='.repeat(60));
console.log(`Total files: ${files.length}`);
console.log(`Files in groups: ${totalFilesInGroups}`);
console.log(`Product groups: ${groups.size}`);
console.log(`Products with 1 image: ${singleImageProducts.length}`);
console.log(`Products with multiple images: ${productsWithMultipleImages}`);
console.log(`\nDifference: ${files.length - totalFilesInGroups} files not grouped`);

if (files.length !== totalFilesInGroups) {
  console.log('\n⚠️  Some files are not grouped!');
  const groupedFiles = new Set<string>();
  for (const groupFiles of groups.values()) {
    groupFiles.forEach(f => groupedFiles.add(f));
  }
  const ungrouped = files.filter(f => !groupedFiles.has(f));
  console.log(`\nUngrouped files (${ungrouped.length}):`);
  ungrouped.forEach(f => console.log(`  - ${f}`));
}

console.log(`\n📸 Products with multiple images (${multiImageProducts.length}):`);
multiImageProducts.slice(0, 10).forEach(p => {
  console.log(`\n  ${p.name} (${p.count} images):`);
  p.files.forEach(f => console.log(`    - ${f}`));
});

if (multiImageProducts.length > 10) {
  console.log(`\n  ... and ${multiImageProducts.length - 10} more`);
}

console.log(`\n✅ Expected products in DB: ${groups.size}`);
console.log(`💾 Actual products in DB: 170`);
console.log(`\nMissing: ${groups.size - 170} products`);

