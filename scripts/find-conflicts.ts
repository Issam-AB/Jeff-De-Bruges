#!/usr/bin/env node
/**
 * Find files that generate same REF or slug
 */

import * as fs from 'fs';
import { parseFilename, cleanProductName, extractSizeCode, extractPrice, generateRef, createSlug } from './lib/parser';
import { groupFilesByProduct } from './lib/parser';

const directory = './public/Photos avec prix';
const files = fs.readdirSync(directory).filter(file => 
  /\.(jpeg|jpg|png)$/i.test(file)
);

const groups = groupFilesByProduct(files);

// Generate REF and slug for each group
const refMap = new Map<string, string[]>();
const slugMap = new Map<string, string[]>();

for (const [key, groupFiles] of groups.entries()) {
  const firstFile = groupFiles[0];
  const metadata = parseFilename(firstFile);
  const baseName = cleanProductName(firstFile);
  
  const ref = generateRef(
    metadata.mainCategory,
    metadata.brand,
    metadata.sizeCode,
    metadata.price,
    new Set() // Empty set to see original REF
  );

  const slugBase = metadata.sizeCode 
    ? `${baseName} ${metadata.sizeCode}`.toLowerCase()
    : baseName;
  const slug = createSlug(slugBase);

  // Track REFs
  if (!refMap.has(ref)) {
    refMap.set(ref, []);
  }
  refMap.get(ref)!.push(firstFile);

  // Track slugs
  if (!slugMap.has(slug)) {
    slugMap.set(slug, []);
  }
  slugMap.get(slug)!.push(firstFile);
}

// Find conflicts
console.log('🔍 Checking for conflicts...\n');

const refConflicts = Array.from(refMap.entries())
  .filter(([ref, files]) => files.length > 1);

const slugConflicts = Array.from(slugMap.entries())
  .filter(([slug, files]) => files.length > 1);

if (refConflicts.length > 0) {
  console.log(`❌ REF Conflicts (${refConflicts.length}):\n`);
  refConflicts.forEach(([ref, files]) => {
    console.log(`  REF: ${ref} (${files.length} files)`);
    files.forEach(f => {
      const metadata = parseFilename(f);
      console.log(`    - ${f}`);
      console.log(`      Name: ${metadata.baseName}`);
      console.log(`      Size: ${metadata.sizeCode || 'N/A'}`);
      console.log(`      Price: ${metadata.price || 'N/A'}`);
    });
    console.log('');
  });
} else {
  console.log('✅ No REF conflicts\n');
}

if (slugConflicts.length > 0) {
  console.log(`❌ Slug Conflicts (${slugConflicts.length}):\n`);
  slugConflicts.forEach(([slug, files]) => {
    console.log(`  Slug: ${slug} (${files.length} files)`);
    files.forEach(f => {
      const metadata = parseFilename(f);
      console.log(`    - ${f}`);
      console.log(`      Name: ${metadata.baseName}`);
      console.log(`      Size: ${metadata.sizeCode || 'N/A'}`);
    });
    console.log('');
  });
} else {
  console.log('✅ No slug conflicts\n');
}

console.log(`📊 Summary:`);
console.log(`  Total groups: ${groups.size}`);
console.log(`  Unique REFs: ${refMap.size}`);
console.log(`  Unique slugs: ${slugMap.size}`);
console.log(`  REF conflicts: ${refConflicts.length}`);
console.log(`  Slug conflicts: ${slugConflicts.length}`);

if (refConflicts.length > 0 || slugConflicts.length > 0) {
  console.log(`\n⚠️  These conflicts cause products to be skipped during import!`);
}

