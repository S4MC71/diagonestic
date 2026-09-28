/**
 * Seed Script — CarePulse Backend
 * Run: ts-node prisma/seed.ts
 *
 * Creates:
 *  1. Initial plans (Basic, Pro, Enterprise)
 *  2. SuperAdmin user
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const PLANS = [
  {
    name: 'Basic',
    priceMonthly: 250000,      // ৳2,500
    priceYearly: 2500000,      // ৳25,000
    maxUsers: 5,
    modules: ['patients', 'lab', 'finance'],
    isActive: true,
  },
  {
    name: 'Pro',
    priceMonthly: 550000,      // ৳5,500
    priceYearly: 5500000,      // ৳55,000
    maxUsers: 15,
    modules: ['patients', 'clinical', 'lab', 'pharmacy', 'home_collection', 'send_out', 'finance', 'commissions', 'inventory', 'accounting', 'recall', 'whatsapp'],
    isActive: true,
  },
  {
    name: 'Enterprise',
    priceMonthly: 1200000,     // ৳12,000
    priceYearly: 12000000,     // ৳1,20,000
    maxUsers: 9999,
    modules: ['patients', 'clinical', 'lab', 'pharmacy', 'home_collection', 'send_out', 'finance', 'commissions', 'inventory', 'accounting', 'recall', 'whatsapp', 'multi_branch'],
    isActive: true,
  },
];

const SUPER_ADMIN = {
  username: 'superadmin',
  password: 'CarePulse@2025!',  // ← CHANGE THIS before production
  name: 'Super Admin',
  role: 'SUPER_ADMIN' as const,
};

async function main() {
  console.log('🌱 Seeding database...\n');

  // 1. Plans
  for (const plan of PLANS) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (existing) {
      console.log(`  ⏭  Plan "${plan.name}" already exists — skipping`);
      continue;
    }
    await prisma.plan.create({ data: plan });
    console.log(`  ✅ Plan "${plan.name}" created`);
  }

  // 2. SuperAdmin user
  const existingSA = await prisma.user.findFirst({ where: { username: SUPER_ADMIN.username } });
  if (existingSA) {
    console.log(`  ⏭  SuperAdmin "${SUPER_ADMIN.username}" already exists — skipping`);
  } else {
    const passwordHash = await bcrypt.hash(SUPER_ADMIN.password, 12);
    await prisma.user.create({
      data: {
        tenantId: null,
        name: SUPER_ADMIN.name,
        username: SUPER_ADMIN.username,
        passwordHash,
        role: SUPER_ADMIN.role,
      },
    });
    console.log(`  ✅ SuperAdmin "${SUPER_ADMIN.username}" created`);
    console.log(`     Default password: ${SUPER_ADMIN.password}`);
    console.log(`     ⚠️  Change this password after first login!`);
  }

  console.log('\n✅ Seed complete!\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
