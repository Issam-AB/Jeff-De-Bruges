/**
 * CSV Report Generator for product imports
 */

import * as fs from 'fs';
import * as path from 'path';
import { ProductSummary, ImportResult } from '../types/product-import';

/**
 * Escape CSV field (handle commas and quotes)
 */
function escapeCSV(field: string | number | null): string {
  if (field === null || field === undefined) {
    return '';
  }
  
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate CSV report from import results
 */
export function generateCSVReport(result: ImportResult): string {
  const headers = ['REF', 'Name', 'Price (MAD)', 'Category', 'Status', 'Message'];
  const rows: string[] = [headers.map(escapeCSV).join(',')];

  for (const summary of result.summary) {
    const row = [
      summary.ref,
      summary.name,
      summary.price,
      summary.category,
      summary.status,
      summary.message || '',
    ];
    rows.push(row.map(escapeCSV).join(','));
  }

  return rows.join('\n');
}

/**
 * Save CSV report to file
 */
export function saveCSVReport(result: ImportResult, outputDir: string = './reports'): string {
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `product-import-${timestamp}.csv`;
  const filepath = path.join(outputDir, filename);

  // Generate and save CSV
  const csv = generateCSVReport(result);
  fs.writeFileSync(filepath, csv, 'utf-8');

  return filepath;
}

/**
 * Generate text summary report
 */
export function generateTextSummary(result: ImportResult): string {
  const lines: string[] = [];
  
  lines.push('='.repeat(60));
  lines.push('PRODUCT IMPORT SUMMARY');
  lines.push('='.repeat(60));
  lines.push('');
  
  lines.push(`Status: ${result.success ? '✓ SUCCESS' : '✗ FAILED'}`);
  lines.push('');
  
  lines.push('Statistics:');
  lines.push(`  Products Created: ${result.productsCreated}`);
  lines.push(`  Products Updated: ${result.productsUpdated}`);
  lines.push(`  Products Skipped: ${result.productsSkipped}`);
  lines.push(`  Errors: ${result.errors.length}`);
  lines.push('');
  
  if (result.errors.length > 0) {
    lines.push('Errors:');
    for (const error of result.errors) {
      lines.push(`  - ${error.filename}: ${error.error}`);
    }
    lines.push('');
  }
  
  // Group by status
  const byStatus = {
    created: result.summary.filter(s => s.status === 'created'),
    updated: result.summary.filter(s => s.status === 'updated'),
    skipped: result.summary.filter(s => s.status === 'skipped'),
    error: result.summary.filter(s => s.status === 'error'),
  };
  
  if (byStatus.created.length > 0) {
    lines.push(`Created Products (${byStatus.created.length}):`);
    for (const product of byStatus.created.slice(0, 10)) {
      lines.push(`  ✓ ${product.ref} - ${product.name} (${product.price} MAD)`);
    }
    if (byStatus.created.length > 10) {
      lines.push(`  ... and ${byStatus.created.length - 10} more`);
    }
    lines.push('');
  }
  
  if (byStatus.updated.length > 0) {
    lines.push(`Updated Products (${byStatus.updated.length}):`);
    for (const product of byStatus.updated.slice(0, 10)) {
      lines.push(`  ↻ ${product.ref} - ${product.name} (${product.price} MAD)`);
    }
    if (byStatus.updated.length > 10) {
      lines.push(`  ... and ${byStatus.updated.length - 10} more`);
    }
    lines.push('');
  }
  
  if (byStatus.skipped.length > 0) {
    lines.push(`Skipped Products (${byStatus.skipped.length}):`);
    for (const product of byStatus.skipped.slice(0, 5)) {
      lines.push(`  ⊘ ${product.ref} - ${product.name}`);
    }
    if (byStatus.skipped.length > 5) {
      lines.push(`  ... and ${byStatus.skipped.length - 5} more`);
    }
    lines.push('');
  }
  
  if (byStatus.error.length > 0) {
    lines.push(`Failed Products (${byStatus.error.length}):`);
    for (const product of byStatus.error) {
      lines.push(`  ✗ ${product.name}: ${product.message}`);
    }
    lines.push('');
  }
  
  lines.push('='.repeat(60));
  
  return lines.join('\n');
}

/**
 * Save text summary to file
 */
export function saveTextSummary(result: ImportResult, outputDir: string = './reports'): string {
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `product-import-summary-${timestamp}.txt`;
  const filepath = path.join(outputDir, filename);

  // Generate and save summary
  const summary = generateTextSummary(result);
  fs.writeFileSync(filepath, summary, 'utf-8');

  return filepath;
}

/**
 * Print summary to console with colors
 */
export function printSummary(result: ImportResult): void {
  console.log('\n' + generateTextSummary(result));
}

/**
 * Generate JSON report
 */
export function generateJSONReport(result: ImportResult): string {
  return JSON.stringify(result, null, 2);
}

/**
 * Save JSON report to file
 */
export function saveJSONReport(result: ImportResult, outputDir: string = './reports'): string {
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `product-import-${timestamp}.json`;
  const filepath = path.join(outputDir, filename);

  // Generate and save JSON
  const json = generateJSONReport(result);
  fs.writeFileSync(filepath, json, 'utf-8');

  return filepath;
}

