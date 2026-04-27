const { PrismaClient } = require('../lib/prisma-client');
const prisma = new PrismaClient();

async function main() {
  try {
    const courses = await prisma.course.findMany();
    console.log('Courses found:', courses.length);
    if (courses.length > 0) {
      console.log('First course isFree:', courses[0].isFree);
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
