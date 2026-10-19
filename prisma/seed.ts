// Seeds the two demo accounts used by the app (there is no sign-up flow).
// Run with: npm run db:seed
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ACCOUNTS = [
  { username: 'alex', password: 'password123' },
  { username: 'sam', password: 'password123' },
];

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  for (const account of ACCOUNTS) {
    const user = await prisma.user.upsert({
      where: { username: account.username },
      update: {},
      create: { username: account.username, passwordHash },
    });
    console.log(`✓ account ready: ${user.username}`);
  }

  console.log('\nSign in at http://localhost:3000 with username "alex" or "sam" (password: password123).');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
