const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@drislam.com' },
    update: {},
    create: {
      email: 'admin@drislam.com',
      name: 'Eng:Mohamed Hanafy',
      password: 'admin123', // In a real app, this should be hashed
    },
  })
  console.log('Admin user created:', admin)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
