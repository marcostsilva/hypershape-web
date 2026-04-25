import prisma from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  console.log("Iniciando seed do banco de dados...")

  const passwordHash = await bcrypt.hash("123456", 10)

  // 1. Criar Academia Base
  const gym = await prisma.organization.upsert({
    where: { slug: "goldgym" },
    update: {},
    create: {
      name: "Gold Gym Oficial",
      slug: "goldgym",
      primaryColor: "#EAB308",
    },
  })
  console.log(`Academia criada/encontrada: ${gym.name}`)

  // 2. Criar Admin da Academia
  const admin = await prisma.user.upsert({
    where: { email: "admin@goldgym.com" },
    update: {},
    create: {
      name: "Admin Gold",
      email: "admin@goldgym.com",
      password: passwordHash,
      globalRole: "USER",
      privacyVersion: "1.0.0",
      acceptedTermsAt: new Date(),
    },
  })

  // Adicionar Membership do admin na academia
  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        userId: admin.id,
        organizationId: gym.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      organizationId: gym.id,
      role: "ADMIN",
      status: "ACTIVE",
    },
  })

  console.log(`Usuário Admin criado: ${admin.email} / 123456`)

  // 3. Criar Super Admin Global
  const superAdmin = await prisma.user.upsert({
    where: { email: "super@hypershape.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "super@hypershape.com",
      password: passwordHash,
      globalRole: "SUPER_ADMIN",
      privacyVersion: "1.0.0",
      acceptedTermsAt: new Date(),
    },
  })
  console.log(`Usuário Super Admin criado: ${superAdmin.email} / 123456`)

  console.log("Seed concluído com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
