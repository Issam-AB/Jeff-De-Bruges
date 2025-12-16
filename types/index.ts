export const SubCategory = {
  'SALONS': ['Salon en L', 'Salon en U'],
  'CANAPES': ['Canapé 2 Places', 'Canapé 3 Places', 'Fauteuils'],
  'CHAMBRE': ['Lits', 'Matelas', 'Table de Chevet'],
  'TABLES': ['Tables Basses', 'Tables à Manger', 'Tables d\'Appoint'],
  'CHAISES': ['Chaises de Salle à Manger', 'Chaises de Bureau'],
  'RANGEMENT': ['Armoires', 'Bibliothèques', 'Commodes', 'Buffets'],
  'DECO': ['Tapis', 'Miroirs', 'Tableaux', 'Vases']
} as const;

export type MainCategory = keyof typeof SubCategory;
export type SubCategoryType = typeof SubCategory[MainCategory][number];

export interface StoreAvailability {
  'Stock Casa': number;
  'Stock Rabat': number;
  'Stock Marrakech': number;
  'Stock Tanger': number;
  'Stock Bouskoura': number;
  'Stock Frimoda': number;
}

export type Product = {
  id: string
  ref: string
  name: string
  slug: string
  mainImage: string
  gallery: string[]
  initialPrice: number
  VenteflashPrice: number
  articleRougePrice: number | null
  dimensions: string
  mainCategory: string
  subCategory: string
  store: string | null
  isActive: boolean
  isArticleRouge: boolean
  isTopProduct: boolean
  createdAt: Date
  updatedAt: Date
  Gallery?: Gallery[]
  // Champs spécifiques aux produits de chocolat
  description?: string | null
  weight?: number | null
  weightUnit?: string | null
  quantity?: number | null
  chocolateType?: string | null
  ingredients?: string[]
  allergens?: string[]
  tags?: string[]
  stock?: number | null
  sku?: string | null
  expirationDays?: number | null
  isGiftBox?: boolean
  isPremium?: boolean
  brand?: string | null
  material?: string | null
  shape?: string | null
}

export type Gallery = {
  id: string
  url: string
  productId: string
  product?: Product
} 