#!/usr/bin/env node
/**
 * Test script to validate the parser with example filenames
 * 
 * Usage: npm run test:parser
 */

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

// Test filenames from the requirements
const testFilenames = [
  'Petit plateau rectangulaire en similicuir rose Alice GM_1000 MAD.jpeg',
  'Coupe ronde sur pieds en inox Argentica GM_1900 MAD.jpeg',
  'Plateau bateau en inox Bateau Argentica GM_3800 MAD.jpeg',
  'Coupe en céramique crème Ceramica GM_1650 MAD.jpeg',
  'Plateau décoratif Flora GM_2500 MAD.jpeg',
  'Coupe sur pied doré martelé Isabella GM_550 MAD.jpeg',
  'Bol décoratif en verre dépoli Lalique MM_850 MAD.jpeg',
  'Boîte cadeau rectangulaire PM_220 MAD.jpeg',
  'Coupe florale en verre decoré doré Warda TGM_2800 MAD.jpeg',
];

console.log('🧪 Testing Product Import Parser\n');
console.log('='.repeat(80));
console.log('\n');

const existingRefs = new Set<string>();

for (const filename of testFilenames) {
  console.log(`📄 Filename: ${filename}`);
  console.log('-'.repeat(80));

  // Validate filename
  const validation = validateFilename(filename);
  if (!validation.valid) {
    console.log('❌ Validation Failed:');
    validation.errors.forEach(err => console.log(`   - ${err}`));
    console.log('\n');
    continue;
  }

  // Parse filename
  const metadata = parseFilename(filename);
  
  // Clean product name
  const cleanName = cleanProductName(filename);
  
  // Extract components
  const sizeCode = extractSizeCode(filename);
  const price = extractPrice(filename);
  
  // Generate reference
  const ref = generateRef(
    metadata.mainCategory,
    metadata.brand,
    metadata.sizeCode,
    metadata.price,
    existingRefs
  );
  existingRefs.add(ref);
  
  // Create slug
  const slug = createSlug(cleanName);
  
  // Get dimensions
  const dimensions = getDimensions(sizeCode);

  // Display results
  console.log('✅ Parsed Successfully:');
  console.log(`   Name:        ${cleanName}`);
  console.log(`   REF:         ${ref}`);
  console.log(`   Slug:        ${slug}`);
  console.log(`   Size:        ${sizeCode || 'N/A'} (${dimensions})`);
  console.log(`   Price:       ${price} MAD`);
  console.log(`   Category:    ${metadata.mainCategory}`);
  console.log(`   SubCategory: ${metadata.subCategory}`);
  console.log(`   Brand:       ${metadata.brand || 'N/A'}`);
  console.log('\n');
}

console.log('='.repeat(80));
console.log('✅ All tests completed!');
console.log(`\n📊 Summary: ${testFilenames.length} filenames tested`);
console.log(`📦 Generated ${existingRefs.size} unique references\n`);

// Test expected outputs
console.log('🎯 Validating Expected Outputs:\n');

const expectations = [
  {
    filename: 'Petit plateau rectangulaire en similicuir rose Alice GM_1000 MAD.jpeg',
    expected: {
      mainCategory: 'Plateaux',
      subCategory: 'Similicuir',
      brand: 'Alice',
      price: 1000,
      sizeCode: 'GM',
    },
  },
  {
    filename: 'Coupe ronde sur pieds en inox Argentica GM_1900 MAD.jpeg',
    expected: {
      mainCategory: 'Coupes',
      subCategory: 'Sur Pieds',
      brand: 'Argentica',
      price: 1900,
      sizeCode: 'GM',
    },
  },
];

let passed = 0;
let failed = 0;

for (const test of expectations) {
  const metadata = parseFilename(test.filename);
  const price = extractPrice(test.filename);
  const sizeCode = extractSizeCode(test.filename);

  const checks = [
    { name: 'Category', actual: metadata.mainCategory, expected: test.expected.mainCategory },
    { name: 'SubCategory', actual: metadata.subCategory, expected: test.expected.subCategory },
    { name: 'Brand', actual: metadata.brand, expected: test.expected.brand },
    { name: 'Price', actual: price, expected: test.expected.price },
    { name: 'Size', actual: sizeCode, expected: test.expected.sizeCode },
  ];

  console.log(`Testing: ${test.filename.substring(0, 50)}...`);

  for (const check of checks) {
    if (check.actual === check.expected) {
      console.log(`  ✅ ${check.name}: ${check.actual}`);
      passed++;
    } else {
      console.log(`  ❌ ${check.name}: expected "${check.expected}", got "${check.actual}"`);
      failed++;
    }
  }
  console.log('');
}

console.log('='.repeat(80));
console.log(`\n📈 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('🎉 All validation tests passed!');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the parser logic.');
  process.exit(1);
}

