// Deletes every account (tasks and shares go with them via cascade) so the
// two sign-up spots open up again. Useful if an account password is forgotten.
// Run with: npm run db:reset-accounts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const { count } = await prisma.user.deleteMany();
console.log(`✓ Deleted ${count} account(s). The app is back to having 0/2 accounts — sign-up is open.`);
await prisma.$disconnect();
