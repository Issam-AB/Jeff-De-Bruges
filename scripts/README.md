# Smart Product Import Script for Prisma/Supabase

Automatically import products from image filenames with intelligent field detection and parsing.

## 📋 Overview

This TypeScript-based import system analyzes product image filenames to automatically extract:
- Product name
- Size code (GM, MM, PM, TGM)
- Price
- Main category
- Sub category (material/style)
- Brand/Store name

## 🚀 Quick Start

### Installation

The required dependencies are already included in `package.json`. If you need to install them:

```bash
npm install
```

### Basic Usage

```bash
# Import all products from default directory
npm run import

# Preview import without making changes (dry run)
npm run import:dry-run

# Update existing products instead of skipping them
npm run import:update

# Show help and all available options
npm run import:help
```

## 📁 Project Structure

```
scripts/
├── import-products.ts          # Main import script with CLI
├── lib/
│   ├── parser.ts              # Filename parsing utilities
│   ├── db-utils.ts            # Prisma database operations
│   └── report-generator.ts    # CSV/Text/JSON report generation
└── types/
    └── product-import.ts      # TypeScript type definitions
```

## 🔍 Filename Pattern Analysis

The script intelligently parses filenames following this pattern:

```
[Product Name] [Size Code]_[Price] MAD.jpeg
```

### Examples

| Filename | Parsed Data |
|----------|-------------|
| `Petit plateau rectangulaire en similicuir rose Alice GM_1000 MAD.jpeg` | Name: "Petit plateau rectangulaire en similicuir rose Alice"<br>Size: GM (Grand Model)<br>Price: 1000 MAD<br>Category: Plateaux<br>SubCategory: Similicuir<br>Brand: Alice |
| `Coupe ronde sur pieds en inox Argentica GM_1900 MAD.jpeg` | Name: "Coupe ronde sur pieds en inox Argentica"<br>Size: GM<br>Price: 1900 MAD<br>Category: Coupes<br>SubCategory: Sur Pieds<br>Brand: Argentica |
| `Bol décoratif en verre dépoli Lalique MM_850 MAD.jpeg` | Name: "Bol décoratif en verre dépoli Lalique"<br>Size: MM (Medium Model)<br>Price: 850 MAD<br>Category: Bols<br>SubCategory: Verre<br>Brand: Lalique |

## 🎯 Features

### Smart Field Detection

#### Size Code Detection
- **TGM** → Très Grand Modèle (50cm)
- **GM** → Grand Modèle (40cm)
- **MM** → Modèle Moyen (30cm)
- **PM** → Petit Modèle (20cm)

#### Category Detection
Automatically detects main category from product name:
- "Plateau" / "Petit plateau" → **Plateaux**
- "Coupe" → **Coupes**
- "Bol" → **Bols**
- "Pot" / "Petit pot" → **Pots**
- "Boîte" → **Boîtes**
- "Coffret" → **Coffrets**

#### SubCategory Detection
Extracts material and style keywords:
- "en similicuir" → **Similicuir**
- "en inox" → **Inox**
- "en céramique" → **Céramique**
- "en verre" → **Verre**
- "sur pied" / "sur pieds" → **Sur Pied**
- "en bambou" / "en bamboo" → **Bambou**
- "nacre" → **Nacre**

#### Brand Detection
Identifies brand names from a comprehensive list including:
Alice, Argentica, Ceramica, Flora, Isabella, Murano, Lalique, Inoxia, Bella, Miranda, and more.

### Reference Generation

Products receive unique references in the format:
```
[CATEGORY]-[BRAND]-[SIZE]-[PRICE]
```

Examples:
- `PLA-ALI-GM-1000` (Plateau Alice Grand Model 1000 MAD)
- `COU-ARG-MM-1900` (Coupe Argentica Medium Model 1900 MAD)
- `BOL-LAL-PM-0850` (Bol Lalique Petit Model 850 MAD)

### Slug Generation

Creates URL-friendly slugs:
- Normalizes French special characters (é→e, è→e, à→a)
- Converts to lowercase
- Replaces spaces with hyphens
- Removes special characters

Example: `"Coupe en céramique crème"` → `"coupe-en-ceramique-creme"`

### File Grouping

Automatically groups multiple images of the same product:
- First image becomes `mainImage`
- Additional images added to `gallery[]`

### Database Operations

- ✅ Creates products with all relations (Gallery)
- ✅ Ensures categories and subcategories exist
- ✅ Detects and skips duplicates (by ref or slug)
- ✅ Optional update of existing products
- ✅ Transaction-based for data integrity
- ✅ Comprehensive validation

## 🎮 CLI Options

| Option | Short | Description |
|--------|-------|-------------|
| `--dry-run` | `-d` | Preview import without making database changes |
| `--dir [path]` | | Specify custom directory (default: `./public/Photos avec prix`) |
| `--category [name]` | `-c` | Import only specific category (e.g., `Plateaux`) |
| `--update` | `-u` | Update existing products instead of skipping them |
| `--verbose` | `-v` | Show detailed output for each product |
| `--help` | `-h` | Show help message |

## 📖 Usage Examples

### Import from Default Directory

```bash
npm run import
```

### Preview Without Importing (Dry Run)

```bash
npm run import:dry-run
# or
npm run import -- --dry-run
```

### Import from Custom Directory

```bash
npm run import -- --dir "./my-products"
```

### Import Only Specific Category

```bash
npm run import -- --category Plateaux
```

### Update Existing Products

```bash
npm run import -- --update
```

### Verbose Mode with Custom Options

```bash
npm run import -- --dir "./products-images" --verbose --update
```

## 📊 Reports

After each import, the script generates three types of reports in the `./reports` directory:

### 1. CSV Report
`product-import-YYYY-MM-DD.csv`

Contains all imported products with columns:
- REF
- Name
- Price (MAD)
- Category
- Status (created/updated/skipped/error)
- Message

### 2. Text Summary
`product-import-summary-YYYY-MM-DD.txt`

Human-readable summary with:
- Import statistics
- Created products list
- Updated products list
- Skipped products list
- Error details

### 3. JSON Report
`product-import-YYYY-MM-DD.json`

Complete structured data including:
- All product summaries
- Detailed error information
- Timestamps
- Full import metadata

## 🔧 Configuration

### Supported Image Formats

- `.jpeg`
- `.jpg`
- `.png`

### Default Image Directory

```
./public/Photos avec prix/
```

### Category Mappings

Edit `scripts/types/product-import.ts` to customize:

```typescript
export const CATEGORY_MAPPINGS: Record<string, string> = {
  'plateau': 'Plateaux',
  'coupe': 'Coupes',
  'bol': 'Bols',
  // Add your own mappings...
};
```

### Material Keywords

Add new materials in `scripts/types/product-import.ts`:

```typescript
export const MATERIAL_KEYWORDS: string[] = [
  'en similicuir',
  'en inox',
  'en céramique',
  // Add your own materials...
];
```

### Brand Keywords

Add new brands in `scripts/types/product-import.ts`:

```typescript
export const BRAND_KEYWORDS: string[] = [
  'Alice',
  'Argentica',
  'Flora',
  // Add your own brands...
];
```

## 🏗️ Database Schema

The script works with this Prisma schema:

```prisma
model Product {
  id              String    @id @default(cuid())
  ref             String    @unique
  name            String
  slug            String    @unique
  mainImage       String
  gallery         String[]
  initialPrice    Float
  VenteflashPrice Float?
  articleRougePrice Float?
  dimensions      String
  mainCategory    String
  subCategory     String
  store           String?
  isActive        Boolean   @default(true)
  isArticleRouge  Boolean   @default(false)
  isTopProduct    Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  Gallery         Gallery[]
}

model Gallery {
  id        String   @id @default(cuid())
  url       String
  productId String
  product   Product  @relation(fields: [productId], references: [id])
}

model Category {
  id            String   @id @default(cuid())
  name          String   @unique
  subcategories String[]
}
```

## ⚠️ Error Handling

The script includes comprehensive error handling:

### Validation Errors
- Invalid file extensions
- Missing price in filename
- Product name too short
- Invalid product data

### Database Errors
- Duplicate ref or slug
- Transaction failures
- Connection issues

All errors are:
- Logged to console (in verbose mode)
- Included in error reports
- Tracked with timestamps
- Associated with specific filenames

## 🔍 Troubleshooting

### "Directory not found" Error

Make sure the directory exists and the path is correct:
```bash
ls "./public/Photos avec prix"
```

### "No image files found"

Check that your directory contains `.jpeg`, `.jpg`, or `.png` files.

### Products Being Skipped

By default, products with duplicate refs or slugs are skipped. Use `--update` to update them:
```bash
npm run import -- --update
```

### Database Connection Issues

Ensure your `.env` file contains valid database credentials:
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### TypeScript Errors

Make sure Prisma client is generated:
```bash
npm run db:generate
```

## 📝 Best Practices

1. **Always run dry-run first**
   ```bash
   npm run import:dry-run
   ```

2. **Check the reports** after import to verify results

3. **Use version control** before running large imports

4. **Backup your database** before updating existing products

5. **Use verbose mode** when debugging issues
   ```bash
   npm run import -- --verbose
   ```

6. **Test with small batches** first before importing all products

## 🛠️ Development

### Running Tests

```bash
# Dry run is a good test
npm run import:dry-run
```

### Modifying Parsing Logic

Edit `scripts/lib/parser.ts` to customize:
- `parseFilename()` - Main parsing function
- `detectMainCategory()` - Category detection
- `detectSubCategory()` - SubCategory detection
- `detectBrand()` - Brand detection
- `generateRef()` - Reference generation

### Modifying Database Logic

Edit `scripts/lib/db-utils.ts` to customize:
- `createProduct()` - Product creation
- `updateProduct()` - Product updates
- `ensureCategory()` - Category management

## 🤝 Support

For issues or questions:
1. Check the error reports in `./reports`
2. Run with `--verbose` flag for detailed logs
3. Use `--dry-run` to test without database changes
4. Review the generated reports

## 📄 License

This script is part of the Jeff De Bruges e-commerce platform.

---

**Created for**: Jeff De Bruges Product Management System  
**Version**: 1.0.0  
**Last Updated**: December 2025

