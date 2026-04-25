const { PrismaClient } = require('./lib/prisma-client');

const prisma = new PrismaClient();

async function main() {
  try {
    const p = await prisma.lessonProgress.findMany();
    console.log(p);
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
