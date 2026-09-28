const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'yonathanaguilar1000@gmail.com';
  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { isSuperAdmin: true }
    });
    console.log(`¡Éxito! El usuario ${user.email} ahora es Super Admin.`);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
