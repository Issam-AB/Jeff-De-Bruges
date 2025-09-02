import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // First, get all products
  const products = await prisma.product.findMany()
  
  // Update each product one by one
  for (const product of products) {
    try {
      await prisma.$executeRaw`
        UPDATE "Product"
        SET ref = ${product.id}
        WHERE id = ${product.id};
      `
    } catch (error) {
      console.error(`Failed to update product ${product.id}:`, error)
    }
  }

  console.log('Migration completed successfully')
}

main()
  .catch(e => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 