# 🍫 Jeff De Bruges - E-Commerce Platform

Application e-commerce pour les chocolats et boîtes cadeaux Jeff De Bruges.

## ✨ Fonctionnalités

- **170 produits** importés automatiquement
- **8 catégories** : Coupes, Plateaux, Pots, Coffrets, Boîtes, Bols, Accessoires, Corbeilles
- **Page produit détaillée** avec toutes les informations (poids, quantité, matériau, forme, etc.)
- **Navigation par catégories** avec filtres par sous-catégories
- **Import automatique** depuis noms de fichiers
- **Commande WhatsApp** intégrée

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Base de données
npx prisma db push
npx prisma generate

# Développement
npm run dev
```

## 📦 Import de Produits

### Import depuis photos

```bash
# Test (sans modifier la DB)
npm run import:dry-run

# Import réel
npm run import

# Nettoyer la DB
npm run import:clear
```

### Format des fichiers

```
[Nom du produit] [Taille]_[Prix] MAD.jpeg
```

Exemple : `Coffret rond Collection Jeff GM_1500 MAD.jpeg`

**Tailles :**
- PM = Petit Modèle (20cm)
- MM = Modèle Moyen (30cm)
- GM = Grand Modèle (40cm)
- TGM = Très Grand Modèle (50cm)

## 📊 Schéma Base de Données

### Product
- Informations de base : nom, ref, slug, prix, dimensions
- Images : mainImage, gallery
- Catégories : mainCategory, subCategory
- Chocolats : weight, quantity, chocolateType, ingredients, allergens
- Métadonnées : tags, brand, material, shape
- Stock : stock, sku, expirationDays
- Flags : isGiftBox, isPremium, isArticleRouge, isTopProduct

### Category
- Catégories avec sous-catégories

### Gallery
- Images multiples par produit

## 🎨 Structure

```
app/
├── (main)/
│   ├── products/[slug]/     # Page produit détaillée
│   └── categories/[category]/ # Navigation par catégorie
components/
├── ChocolateProductView.tsx  # Vue produit chocolat
└── ProductCard.tsx           # Carte produit
scripts/
├── import-products.ts        # Script d'import
├── lib/
│   ├── parser.ts            # Parsing des noms de fichiers
│   ├── db-utils.ts          # Opérations DB
│   └── report-generator.ts # Génération de rapports
└── types/
    └── product-import.ts    # Types TypeScript
```

## 📱 Technologies

- **Next.js 14** - Framework React
- **Prisma** - ORM
- **PostgreSQL** - Base de données (Supabase)
- **TypeScript** - Langage
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

## 🔧 Scripts

```bash
npm run dev              # Développement
npm run build           # Build production
npm run start           # Démarrer production
npm run import          # Importer produits
npm run import:dry-run  # Test import
npm run import:clear    # Vider DB
npm run db:studio       # Prisma Studio
npm run db:push         # Push schema
```

## 📈 Statistiques

- **170 produits** importés
- **8 catégories** principales
- **30+ collections/marques**
- **Prix moyen** : ~1,450 MAD

## 🎯 Prochaines Étapes

- [ ] Ajouter filtres avancés (prix, taille, type)
- [ ] Système de panier
- [ ] Gestion des favoris
- [ ] Système de recherche amélioré
- [ ] Reviews et ratings
- [ ] Multi-langue (FR/AR)

## 📝 Licence

Propriétaire - Jeff De Bruges
