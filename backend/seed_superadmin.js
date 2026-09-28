import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@ya.com';
  const password = 'godmode_hashed';
  
  const password_hash = await bcrypt.hash(password, 10);
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: { password_hash, isSuperAdmin: true, role: 'SUPER_ADMIN' }
    });
    console.log('Superadmin updated successfully');
  } else {
    // We need a company for this user based on schema if companyId is required, but it's optional: `companyId String?`
    await prisma.user.create({
      data: {
        nombre: 'Super Admin',
        email,
        password_hash,
        isSuperAdmin: true,
        role: 'SUPER_ADMIN',
        isApproved: true
      }
    });
    console.log('Superadmin created successfully');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
