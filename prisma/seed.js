const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@sedra.com";
const ADMIN_PHONE = "+971500000000";
const ADMIN_PASSWORD = "Admin@1234";

async function main() {
  const existing = await prisma.user.findFirst({ where: { email: ADMIN_EMAIL } });
  if (!existing) {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        phone: ADMIN_PHONE,
        password: hashed,
        plainPassword: ADMIN_PASSWORD,
        role: "admin",
      },
    });
    console.log("✅ Default admin account created");
    console.log("   Email:   ", ADMIN_EMAIL);
    console.log("   Phone:   ", ADMIN_PHONE);
    console.log("   Password:", ADMIN_PASSWORD);
  } else {
    console.log("ℹ️  Admin account already exists:", ADMIN_EMAIL);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
