/**
 * Filename parsing utilities for product import
 */

import {
  FilenameMetadata,
  SIZE_DIMENSIONS,
  CATEGORY_MAPPINGS,
  MATERIAL_KEYWORDS,
  BRAND_KEYWORDS,
} from '../types/product-import';

/**
 * Normalize French special characters and create URL-friendly slug
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

/**
 * Extract size code from filename (GM, MM, PM, TGM)
 */
export function extractSizeCode(filename: string): string | null {
  const sizeMatch = filename.match(/\b(TGM|GM|MM|PM)(?:_|\s)/i);
  return sizeMatch ? sizeMatch[1].toUpperCase() : null;
}

/**
 * Extract price from filename (number before "MAD")
 */
export function extractPrice(filename: string): number | null {
  const priceMatch = filename.match(/[_\s](\d+)\s*MAD/i);
  return priceMatch ? parseFloat(priceMatch[1]) : null;
}

/**
 * Remove size code and price from product name
 */
export function cleanProductName(filename: string): string {
  // Remove file extension
  let name = filename.replace(/\.(jpeg|jpg|png)$/i, '');
  
  // Remove price part (everything from underscore/space before number + MAD)
  name = name.replace(/[_\s]?\d+\s*MAD.*$/i, '');
  
  // Remove size code if at the end
  name = name.replace(/\s*(TGM|GM|MM|PM)\s*$/i, '');
  
  // Remove trailing underscores and spaces
  name = name.replace(/[_\s]+$/, '');
  
  return name.trim();
}

/**
 * Detect main category from product name
 */
export function detectMainCategory(productName: string): string {
  const lowerName = productName.toLowerCase();
  
  // Check for exact matches first (e.g., "Petit plateau" before "plateau")
  for (const [keyword, category] of Object.entries(CATEGORY_MAPPINGS)) {
    if (lowerName.startsWith(keyword)) {
      return category;
    }
  }
  
  // Default to "Accessoires" if no match
  return 'Accessoires';
}

/**
 * Detect subcategory (material/style) from product name
 */
export function detectSubCategory(productName: string): string {
  const lowerName = productName.toLowerCase();
  
  // Check for material keywords (prioritize longer/more specific matches first)
  const sortedMaterials = [...MATERIAL_KEYWORDS].sort((a, b) => b.length - a.length);
  
  for (const material of sortedMaterials) {
    if (lowerName.includes(material.toLowerCase())) {
      // Clean up and capitalize
      return material
        .replace(/^en\s+/i, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
  
  // If no material found, try to extract descriptive words
  const words = productName.split(' ');
  if (words.length >= 3) {
    // Return the middle descriptive part
    const descriptive = words.slice(2, 4).join(' ');
    if (descriptive && descriptive.length > 2) {
      return descriptive;
    }
  }
  
  return 'Divers';
}

/**
 * Detect brand/store name from product name
 */
export function detectBrand(productName: string): string | null {
  const words = productName.split(' ');
  
  // Check for "Collection Jeff" first
  if (productName.toLowerCase().includes('collection jeff')) {
    return 'Collection Jeff';
  }
  
  // Check each word against brand keywords
  for (const word of words) {
    const cleanWord = word.replace(/[,\.]/g, '');
    for (const brand of BRAND_KEYWORDS) {
      if (cleanWord.toLowerCase() === brand.toLowerCase()) {
        return brand;
      }
    }
  }
  
  // Check if last word might be a brand (capitalized, not a common word)
  const lastWord = words[words.length - 1]?.replace(/[,\.]/g, '');
  if (lastWord && /^[A-Z][a-z]+/.test(lastWord)) {
    // Avoid common French words
    const commonWords = ['noir', 'blanc', 'bleu', 'vert', 'rouge', 'doré', 'argenté'];
    if (!commonWords.includes(lastWord.toLowerCase())) {
      return lastWord;
    }
  }
  
  return null;
}

/**
 * Detect shape from product name (for chocolate boxes)
 */
export function detectShape(productName: string): string | null {
  const lowerName = productName.toLowerCase();
  const shapes = ['rectangulaire', 'carré', 'cubique', 'rond', 'ovale', 'hexagonal', 'bateau'];
  
  for (const shape of shapes) {
    if (lowerName.includes(shape)) {
      return shape.charAt(0).toUpperCase() + shape.slice(1);
    }
  }
  
  return null;
}

/**
 * Detect material from product name
 */
export function detectMaterial(productName: string): string | null {
  const lowerName = productName.toLowerCase();
  
  // Check for material keywords
  for (const material of MATERIAL_KEYWORDS) {
    if (lowerName.includes(material.toLowerCase())) {
      // Clean up and return
      return material
        .replace(/^en\s+/i, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
  
  // Check for specific materials
  if (lowerName.includes('nacre')) return 'Nacre';
  if (lowerName.includes('similicuir') || lowerName.includes('simili cuir')) return 'Similicuir';
  if (lowerName.includes('tissu')) return 'Tissu';
  if (lowerName.includes('inox')) return 'Inox';
  if (lowerName.includes('céramique') || lowerName.includes('ceramique')) return 'Céramique';
  if (lowerName.includes('verre')) return 'Verre';
  if (lowerName.includes('bambou') || lowerName.includes('bamboo')) return 'Bambou';
  if (lowerName.includes('bois')) return 'Bois';
  if (lowerName.includes('porcelaine')) return 'Porcelaine';
  if (lowerName.includes('métal') || lowerName.includes('metal')) return 'Métal';
  if (lowerName.includes('cristal')) return 'Cristal';
  if (lowerName.includes('terre cuite')) return 'Terre cuite';
  if (lowerName.includes('osier')) return 'Osier';
  
  return null;
}

/**
 * Detect chocolate type from product name
 */
export function detectChocolateType(productName: string): string | null {
  const lowerName = productName.toLowerCase();
  
  if (lowerName.includes('assortiment varié') || lowerName.includes('assortiment varie')) {
    return 'assortiment';
  }
  if (lowerName.includes('chocolat noir') || lowerName.includes('noir')) {
    return 'noir';
  }
  if (lowerName.includes('chocolat au lait') || lowerName.includes('lait')) {
    return 'lait';
  }
  if (lowerName.includes('chocolat blanc') || lowerName.includes('blanc')) {
    return 'blanc';
  }
  if (lowerName.includes('mixte')) {
    return 'mixte';
  }
  
  // Default to assortiment if it's a gift box
  if (lowerName.includes('cadeau') || lowerName.includes('coffret') || lowerName.includes('boîte')) {
    return 'assortiment';
  }
  
  return null;
}

/**
 * Detect tags from product name
 */
export function detectTags(productName: string): string[] {
  const lowerName = productName.toLowerCase();
  const tags: string[] = [];
  
  if (lowerName.includes('assortiment varié') || lowerName.includes('assortiment varie')) {
    tags.push('assortiment varié');
  }
  if (lowerName.includes('premium') || lowerName.includes('royal') || lowerName.includes('prestige')) {
    tags.push('premium');
  }
  if (lowerName.includes('vip')) {
    tags.push('VIP');
    tags.push('premium');
  }
  if (lowerName.includes('cadeau') || lowerName.includes('coffret')) {
    tags.push('cadeau');
  }
  if (lowerName.includes('collection jeff')) {
    tags.push('Collection Jeff');
  }
  if (lowerName.includes('décoratif') || lowerName.includes('decoratif')) {
    tags.push('décoratif');
  }
  if (lowerName.includes('luxe') || lowerName.includes('luxury')) {
    tags.push('luxe');
  }
  
  return tags;
}

/**
 * Detect if product is a gift box
 */
export function detectIsGiftBox(productName: string): boolean {
  const lowerName = productName.toLowerCase();
  return lowerName.includes('cadeau') || 
         lowerName.includes('coffret') || 
         lowerName.includes('boîte cadeau') ||
         lowerName.includes('boite cadeau');
}

/**
 * Detect if product is premium
 */
export function detectIsPremium(productName: string): boolean {
  const lowerName = productName.toLowerCase();
  return lowerName.includes('premium') || 
         lowerName.includes('royal') || 
         lowerName.includes('prestige') ||
         lowerName.includes('vip') ||
         lowerName.includes('luxe') ||
         lowerName.includes('luxury');
}

/**
 * Parse complete filename and extract all metadata
 */
export function parseFilename(filename: string): FilenameMetadata {
  const extension = filename.match(/\.(jpeg|jpg|png)$/i)?.[1] || 'jpeg';
  const sizeCode = extractSizeCode(filename);
  const price = extractPrice(filename);
  const baseName = cleanProductName(filename);
  const mainCategory = detectMainCategory(baseName);
  const subCategory = detectSubCategory(baseName);
  const brand = detectBrand(baseName);
  const shape = detectShape(baseName);
  const material = detectMaterial(baseName);
  const chocolateType = detectChocolateType(baseName);
  const tags = detectTags(baseName);
  const isGiftBox = detectIsGiftBox(baseName);
  const isPremium = detectIsPremium(baseName);
  
  return {
    baseName,
    sizeCode,
    price,
    extension,
    mainCategory,
    subCategory,
    brand,
    shape,
    material,
    chocolateType,
    tags,
    isGiftBox,
    isPremium,
  };
}

/**
 * Generate unique product reference
 */
export function generateRef(
  mainCategory: string,
  brand: string | null,
  sizeCode: string | null,
  price: number | null,
  existingRefs: Set<string>
): string {
  // Create category prefix
  const categoryPrefix = mainCategory.substring(0, 3).toUpperCase();
  
  // Create brand part
  const brandPart = brand ? brand.substring(0, 3).toUpperCase() : 'GEN';
  
  // Create size part
  const sizePart = sizeCode || 'STD';
  
  // Create price part (use last 4 digits)
  const pricePart = price ? String(Math.floor(price)).padStart(4, '0').slice(-4) : '0000';
  
  // Combine parts
  let ref = `${categoryPrefix}-${brandPart}-${sizePart}-${pricePart}`;
  
  // If ref exists, add counter
  let counter = 1;
  let finalRef = ref;
  while (existingRefs.has(finalRef)) {
    finalRef = `${ref}-${counter}`;
    counter++;
  }
  
  return finalRef;
}

/**
 * Get dimensions text from size code
 */
export function getDimensions(sizeCode: string | null): string {
  if (!sizeCode) return 'Standard';
  return SIZE_DIMENSIONS[sizeCode] || sizeCode;
}

/**
 * Group files by product name (same product, different images)
 */
export function groupFilesByProduct(filenames: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  
  for (const filename of filenames) {
    const baseName = cleanProductName(filename);
    const sizeCode = extractSizeCode(filename);
    const price = extractPrice(filename);
    
    // Create a unique key for grouping
    const key = `${baseName}_${sizeCode}_${price}`;
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(filename);
  }
  
  return groups;
}

/**
 * Validate that a filename has required components
 */
export function validateFilename(filename: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check file extension
  if (!/\.(jpeg|jpg|png)$/i.test(filename)) {
    errors.push('Invalid file extension (must be .jpeg, .jpg, or .png)');
  }
  
  // Check if price exists
  const price = extractPrice(filename);
  if (price === null) {
    errors.push('No price found in filename');
  }
  
  // Check if name is not empty
  const cleanName = cleanProductName(filename);
  if (!cleanName || cleanName.length < 3) {
    errors.push('Product name too short or empty');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

