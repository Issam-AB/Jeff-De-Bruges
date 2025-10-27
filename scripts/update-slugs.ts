import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(name: string, ref: string): string {
  const slugBase = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
  
  const refSlug = ref
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Combine name + ref for unique slug
  return `${slugBase}-${refSlug}`.substring(0, 100);
}

async function updateSlugs() {
  try {
    console.log('🔄 Updating product slugs...');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        ref: true,
        slug: true
      }
    });

    console.log(`📦 Found ${products.length} products`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      const newSlug = generateSlug(product.name, product.ref);
      
      if (product.slug !== newSlug) {
        await prisma.product.update({
          where: { id: product.id },
          data: { slug: newSlug }
        });
        console.log(`✅ Updated: ${product.name} (${product.ref}) -> ${newSlug}`);
        updated++;
      } else {
        skipped++;
      }
    }

    console.log('\n✨ Done!');
    console.log(`   Updated: ${updated} products`);
    console.log(`   Skipped: ${skipped} products (already correct)`);
    
  } catch (error) {
    console.error('❌ Error updating slugs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateSlugs();
