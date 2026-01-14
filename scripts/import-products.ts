#!/usr/bin/env node
/**
 * Smart Product Import Script for Prisma/Supabase
 * 
 * Automatically imports products from filenames with intelligent field detection.
 * 
 * Usage:
 *   npm run import              # Import from default directory
 *   npm run import -- --dry-run # Preview without inserting
 *   npm run import -- --help    # Show help
 */

import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import {
  parseFilename,
  cleanProductName,
  extractSizeCode,
  extractPrice,
  generateRef,
  getDimensions,
  groupFilesByProduct,
  validateFilename,
  createSlug,
} from './lib/parser';
import {
  upsertProduct,
  getAllProductRefs,
  getProductStats,
  validateProductData,
} from './lib/db-utils';
import {
  saveCSVReport,
  saveTextSummary,
  saveJSONReport,
  printSummary,
} from './lib/report-generator';
import {
  ImportOptions,
  ImportResult,
  ImportError,
  ProductSummary,
  ParsedProduct,
} from './types/product-import';

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Parse command line arguments
 */
function parseArgs(): ImportOptions {
  const args = process.argv.slice(2);
  const options: ImportOptions = {
    dryRun: false,
    directory: './public/Photos avec prix',
    skipDuplicates: true,
    verbose: false,
    updateExisting: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      
      case '--dir':
      case '--directory':
        options.directory = args[++i];
        break;
      
      case '--category':
      case '-c':
        options.category = args[++i];
        break;
      
      case '--update':
      case '-u':
        options.updateExisting = true;
        break;
      
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          printHelp();
          process.exit(1);
        }
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Product Import Script
=====================

Usage: npm run import -- [options]

Options:
  --dry-run, -d          Preview import without inserting to database
  --dir, --directory     Specify directory with product images (default: ./public/Photos avec prix)
  --category, -c         Import only specific category
  --update, -u           Update existing products instead of skipping
  --verbose, -v          Show detailed output
  --help, -h             Show this help message

Examples:
  npm run import                              # Import all products
  npm run import -- --dry-run                 # Preview without inserting
  npm run import -- --dir ./products-images   # Import from specific directory
  npm run import -- --category Plateaux       # Import only Plateaux category
  npm run import -- --update                  # Update existing products
  `);
}

/**
 * Read image files from directory
 */
function readImageFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    throw new Error(`Directory not found: ${directory}`);
  }

  const files = fs.readdirSync(directory);
  return files.filter(file => /\.(jpeg|jpg|png)$/i.test(file));
}

/**
 * Process files and create product data
 */
function processFiles(
  files: string[],
  directory: string,
  existingRefs: Set<string>,
  options: ImportOptions
): { products: ParsedProduct[]; errors: ImportError[] } {
  const products: ParsedProduct[] = [];
  const errors: ImportError[] = [];

  // Group files by product
  const groups = groupFilesByProduct(files);

  for (const [groupKey, groupFiles] of Array.from(groups.entries())) {
    try {
      // Validate first file in group
      const firstFile = groupFiles[0];
      const validation = validateFilename(firstFile);
      
      if (!validation.valid) {
        errors.push({
          filename: firstFile,
          error: validation.errors.join(', '),
          timestamp: new Date(),
        });
        continue;
      }

      // Parse filename metadata
      const metadata = parseFilename(firstFile);
      
      // Filter by category if specified
      if (options.category && metadata.mainCategory !== options.category) {
        continue;
      }

      // Generate product data
      const ref = generateRef(
        metadata.mainCategory,
        metadata.brand,
        metadata.sizeCode,
        metadata.price,
        existingRefs
      );
      
      existingRefs.add(ref);

      // Include size in slug to avoid duplicates for same product in different sizes
      const slugBase = metadata.sizeCode 
        ? `${metadata.baseName} ${metadata.sizeCode}`.toLowerCase()
        : metadata.baseName;
      const slug = createSlug(slugBase);
      const dimensions = getDimensions(metadata.sizeCode);

      // Create image paths
      const mainImage = `/Photos avec prix/${groupFiles[0]}`;
      const gallery = groupFiles.slice(1).map(file => `/Photos avec prix/${file}`);

      // Generate SKU from ref
      const sku = `JDB-${ref}`;
      
      // Estimate weight based on size (can be adjusted later)
      const estimatedWeight: Record<string, number> = {
        'PM': 200,  // 200g for small
        'MM': 400,  // 400g for medium
        'GM': 600,  // 600g for large
        'TGM': 1000, // 1kg for extra large
      };
      const weight = metadata.sizeCode ? estimatedWeight[metadata.sizeCode] || null : null;
      
      // Estimate quantity based on size
      const estimatedQuantity: Record<string, number> = {
        'PM': 12,  // 12 pieces for small
        'MM': 24,  // 24 pieces for medium
        'GM': 36,  // 36 pieces for large
        'TGM': 48, // 48 pieces for extra large
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
        // Nouveaux champs pour chocolats
        description: `Boîte de chocolats ${metadata.baseName.toLowerCase()}. ${metadata.isGiftBox ? 'Idéal pour offrir.' : ''}`,
        weight: weight,
        weightUnit: 'g',
        quantity: quantity,
        chocolateType: metadata.chocolateType || 'assortiment',
        ingredients: [], // À remplir manuellement si nécessaire
        allergens: [], // À remplir manuellement si nécessaire
        tags: metadata.tags || [],
        stock: 0, // Stock par défaut (correspond au schéma)
        sku: sku,
        expirationDays: 180, // 6 mois par défaut pour chocolats
        isGiftBox: metadata.isGiftBox,
        isPremium: metadata.isPremium,
        brand: metadata.brand,
        material: metadata.material,
        shape: metadata.shape,
      };

      // Validate product data
      const productValidation = validateProductData(product);
      if (!productValidation.valid) {
        errors.push({
          filename: firstFile,
          error: productValidation.errors.join(', '),
          timestamp: new Date(),
        });
        continue;
      }

      products.push(product);

      if (options.verbose) {
        console.log(`✓ Processed: ${metadata.baseName} (${ref})`);
      }
    } catch (error) {
      errors.push({
        filename: groupFiles[0],
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
      
      if (options.verbose) {
        console.error(`✗ Error processing ${groupFiles[0]}:`, error);
      }
    }
  }

  return { products, errors };
}

/**
 * Import products to database
 */
async function importProducts(
  products: ParsedProduct[],
  options: ImportOptions
): Promise<{ summary: ProductSummary[]; errors: ImportError[] }> {
  const summary: ProductSummary[] = [];
  const errors: ImportError[] = [];

  for (const product of products) {
    try {
      if (options.dryRun) {
        summary.push({
          ref: product.ref,
          name: product.name,
          price: product.initialPrice,
          category: product.mainCategory,
          status: 'created',
          message: '[DRY RUN] Would create',
        });
      } else {
        const result = await upsertProduct(prisma, product, options.updateExisting);
        
        summary.push({
          ref: product.ref,
          name: product.name,
          price: product.initialPrice,
          category: product.mainCategory,
          status: result.action,
          message: result.action === 'skipped' ? 'Already exists' : undefined,
        });

        if (options.verbose) {
          const statusIcon = result.action === 'created' ? '✓' : result.action === 'updated' ? '↻' : '⊘';
          console.log(`${statusIcon} ${result.action.toUpperCase()}: ${product.name}`);
        }
      }
    } catch (error) {
      errors.push({
        filename: product.rawFilename,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });

      summary.push({
        ref: product.ref,
        name: product.name,
        price: product.initialPrice,
        category: product.mainCategory,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      if (options.verbose) {
        console.error(`✗ ERROR: ${product.name}:`, error);
      }
    }
  }

  return { summary, errors };
}

/**
 * Main execution function
 */
async function main() {
  console.log('\n🚀 Starting Product Import...\n');

  try {
    // Parse command line options
    const options = parseArgs();

    console.log('Configuration:');
    console.log(`  Directory: ${options.directory}`);
    console.log(`  Dry Run: ${options.dryRun ? 'YES' : 'NO'}`);
    console.log(`  Update Existing: ${options.updateExisting ? 'YES' : 'NO'}`);
    if (options.category) {
      console.log(`  Filter Category: ${options.category}`);
    }
    console.log('');

    // Read files from directory
    console.log('📁 Reading files...');
    const files = readImageFiles(options.directory);
    console.log(`  Found ${files.length} image files\n`);

    if (files.length === 0) {
      console.log('⚠️  No image files found. Exiting.');
      process.exit(0);
    }

    // Get existing refs
    console.log('🔍 Checking existing products...');
    const existingRefs = options.dryRun ? new Set<string>() : await getAllProductRefs(prisma);
    console.log(`  Found ${existingRefs.size} existing products\n`);

    // Process files
    console.log('⚙️  Processing files...');
    const { products, errors: processingErrors } = processFiles(
      files,
      options.directory,
      existingRefs,
      options
    );
    console.log(`  Processed ${products.length} products`);
    if (processingErrors.length > 0) {
      console.log(`  ⚠️  ${processingErrors.length} files had errors\n`);
    } else {
      console.log('');
    }

    if (products.length === 0) {
      console.log('⚠️  No valid products to import. Exiting.');
      await prisma.$disconnect();
      process.exit(0);
    }

    // Import products
    console.log(`💾 ${options.dryRun ? 'Simulating' : 'Importing'} products to database...`);
    const { summary, errors: importErrors } = await importProducts(products, options);

    // Compile results
    const allErrors = [...processingErrors, ...importErrors];
    const result: ImportResult = {
      success: allErrors.length === 0,
      productsCreated: summary.filter(s => s.status === 'created').length,
      productsUpdated: summary.filter(s => s.status === 'updated').length,
      productsSkipped: summary.filter(s => s.status === 'skipped').length,
      errors: allErrors,
      summary,
    };

    // Print summary
    printSummary(result);

    // Save reports
    if (!options.dryRun) {
      console.log('\n📄 Generating reports...');
      const csvPath = saveCSVReport(result);
      const txtPath = saveTextSummary(result);
      const jsonPath = saveJSONReport(result);
      console.log(`  CSV Report: ${csvPath}`);
      console.log(`  Text Summary: ${txtPath}`);
      console.log(`  JSON Report: ${jsonPath}`);

      // Show database stats
      console.log('\n📊 Database Statistics:');
      const stats = await getProductStats(prisma);
      console.log(`  Total Products: ${stats.total}`);
      console.log(`  Categories:`);
      for (const cat of stats.byCategory) {
        console.log(`    - ${cat.category}: ${cat.count}`);
      }
    } else {
      console.log('\n[DRY RUN] No changes were made to the database.');
    }

    console.log('\n✅ Import completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run main function
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };

