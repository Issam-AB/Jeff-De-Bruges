/**
 * TypeScript types for product import system
 */

export interface ParsedProduct {
  name: string;
  ref: string;
  slug: string;
  mainImage: string;
  gallery: string[];
  initialPrice: number;
  dimensions: string;
  mainCategory: string;
  subCategory: string;
  store: string | null;
  isActive: boolean;
  sizeCode?: string;
  rawFilename: string;
  // Champs spécifiques aux produits de chocolat
  description?: string | null;
  weight?: number | null;
  weightUnit?: string | null;
  quantity?: number | null;
  chocolateType?: string | null;
  ingredients?: string[];
  allergens?: string[];
  tags?: string[];
  stock?: number | null;
  sku?: string | null;
  expirationDays?: number | null;
  isGiftBox?: boolean;
  isPremium?: boolean;
  brand?: string | null;
  material?: string | null;
  shape?: string | null;
}

export interface FilenameMetadata {
  baseName: string;
  sizeCode: string | null;
  price: number | null;
  extension: string;
  mainCategory: string;
  subCategory: string;
  brand: string | null;
  // Nouveaux champs
  shape: string | null;
  material: string | null;
  chocolateType: string | null;
  tags: string[];
  isGiftBox: boolean;
  isPremium: boolean;
}

export interface ImportOptions {
  dryRun: boolean;
  directory: string;
  category?: string;
  skipDuplicates: boolean;
  verbose: boolean;
  updateExisting: boolean;
}

export interface ImportResult {
  success: boolean;
  productsCreated: number;
  productsUpdated: number;
  productsSkipped: number;
  errors: ImportError[];
  summary: ProductSummary[];
}

export interface ImportError {
  filename: string;
  error: string;
  timestamp: Date;
}

export interface ProductSummary {
  ref: string;
  name: string;
  price: number;
  category: string;
  status: 'created' | 'updated' | 'skipped' | 'error';
  message?: string;
}

export interface GroupedFile {
  productName: string;
  files: string[];
  metadata: FilenameMetadata;
}

export const SIZE_DIMENSIONS: Record<string, string> = {
  TGM: 'Très Grand Modèle (50cm)',
  GM: 'Grand Modèle (40cm)',
  MM: 'Modèle Moyen (30cm)',
  PM: 'Petit Modèle (20cm)',
};

export const CATEGORY_MAPPINGS: Record<string, string> = {
  'plateau': 'Plateaux',
  'petit plateau': 'Plateaux',
  'coupe': 'Coupes',
  'bol': 'Bols',
  'pot': 'Pots',
  'petit pot': 'Pots',
  'boîte': 'Boîtes',
  'coffret': 'Coffrets',
  'corbeille': 'Corbeilles',
  'encensoir': 'Encensoirs',
  'écrin': 'Écrins',
  'bateau': 'Plateaux',
};

export const MATERIAL_KEYWORDS: string[] = [
  'en similicuir',
  'en inox',
  'en céramique',
  'en verre',
  'en bambou',
  'en bamboo',
  'en tissu',
  'en bois',
  'en terre cuite',
  'en porcelaine',
  'en métal',
  'en cristal',
  'nacre',
  'sur pied',
  'sur pieds',
  'sur socle',
  'ajouré',
  'ajourée',
  'perforé',
  'texturé',
  'texturée',
];

export const BRAND_KEYWORDS: string[] = [
  'Alice',
  'Argentica',
  'Ceramica',
  'Céramica',
  'Flora',
  'Isabella',
  'Murano',
  'Azzuro',
  'Lalique',
  'Inoxia',
  'Jeff',
  'Cashemir',
  'VIP',
  'Couture',
  'Anabella',
  'Olga',
  'Medicis',
  'Mathilda',
  'Warda',
  'Miranda',
  'Metallica',
  'Bohemia',
  'Rosa',
  'Marshica',
  'Tiara',
  'Terracotta',
  'Corallia',
  'Bella',
  'Mbikhra',
  'Indigha',
  'Piassetti',
  'Lola',
  'Narjis',
  'Natura',
  'Ambre',
  'Amber',
  'Angelina',
  'Exotica',
  'Cristina',
];

