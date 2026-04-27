const { PrismaClient } = require('../lib/prisma-client');
const prisma = new PrismaClient();

async function main() {
  try {
    const result = await prisma.$queryRaw`PRAGMA table_info(Course)`;
    console.log('Course Table Structure:', result);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
