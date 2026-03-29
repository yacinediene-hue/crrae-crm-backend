const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const passwordAdmin = await bcrypt.hash('Admin12345', 10)
  const passwordManager = await bcrypt.hash('Manager12345', 10)
  const passwordAgent = await bcrypt.hash('Agent12345', 10)

  const users = [
    {
      name: 'Admin CRRAE',
      email: 'admin@crrae-umoa.org',
      role: 'admin',
      active: true,
      passwordHash: passwordAdmin,
    },
    {
      name: 'Ismael COULIBALY',
      email: 'icoulibaly@intracrrae.local',
      role: 'manager',
      active: true,
      passwordHash: passwordManager,
    },
    {
      name: 'Michèle KACOU',
      email: 'mkacou@crrae.org',
      role: 'manager',
      active: true,
      passwordHash: passwordManager,
    },
    {
      name: 'Fatty KOUAME',
      email: 'fahounan@crrae.org',
      role: 'manager',
      active: true,
      passwordHash: passwordManager,
    },
    {
      name: 'Caroline OKOBE',
      email: 'cokobe@crrae.org',
      role: 'agent',
      active: true,
      passwordHash: passwordAgent,
    },
    {
      name: 'Séverine KPODA',
      email: 'dkpoda@crrae.org',
      role: 'agent',
      active: true,
      passwordHash: passwordAgent,
    },
    {
      name: 'Fatou KAMAGATE',
      email: 'fkamagate@intracrrae.local',
      role: 'agent',
      active: true,
      passwordHash: passwordAgent,
    },
    {
      name: 'Koffi STEPHANE',
      email: 'slkoffi@intracrrae.local',
      role: 'agent',
      active: true,
      passwordHash: passwordAgent,
    },
    {
      name: 'Yacine DIENE',
      email: 'yacine.diene@gmail.com',
      role: 'admin',
      active: true,
      passwordHash: passwordAdmin,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        active: user.active,
        passwordHash: user.passwordHash,
      },
      create: user,
    })
  }

  console.log('✅ Seed users terminé')
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
