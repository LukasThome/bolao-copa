import { PrismaClient, FaseJogo } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean existing games (preserves users)
  await prisma.palpite.deleteMany()
  await prisma.jogo.deleteMany()

  const jogos = [
    {
      timeCasa: 'México',
      timeVisita: 'Canadá',
      dataHora: new Date('2026-06-11T21:00:00-03:00'),
      fase: FaseJogo.GRUPOS,
      grupo: 'A',
    },
    {
      timeCasa: 'Brasil',
      timeVisita: 'Alemanha',
      dataHora: new Date('2026-06-12T18:00:00-03:00'),
      fase: FaseJogo.GRUPOS,
      grupo: 'B',
    },
    {
      timeCasa: 'Argentina',
      timeVisita: 'França',
      dataHora: new Date('2026-06-12T21:00:00-03:00'),
      fase: FaseJogo.GRUPOS,
      grupo: 'C',
    },
    {
      timeCasa: 'Espanha',
      timeVisita: 'Portugal',
      dataHora: new Date('2026-06-13T18:00:00-03:00'),
      fase: FaseJogo.GRUPOS,
      grupo: 'D',
    },
    {
      timeCasa: 'Holanda',
      timeVisita: 'Bélgica',
      dataHora: new Date('2026-06-13T21:00:00-03:00'),
      fase: FaseJogo.GRUPOS,
      grupo: 'E',
    },
    {
      timeCasa: 'Inglaterra',
      timeVisita: 'Itália',
      dataHora: new Date('2026-06-14T18:00:00-03:00'),
      fase: FaseJogo.GRUPOS,
      grupo: 'F',
    },
    {
      timeCasa: 'Japão',
      timeVisita: 'Coreia do Sul',
      dataHora: new Date('2026-06-14T21:00:00-03:00'),
      fase: FaseJogo.GRUPOS,
      grupo: 'G',
    },
    {
      timeCasa: 'Estados Unidos',
      timeVisita: 'Uruguai',
      dataHora: new Date('2026-06-15T18:00:00-03:00'),
      fase: FaseJogo.GRUPOS,
      grupo: 'H',
    },
  ]

  for (const jogo of jogos) {
    await prisma.jogo.create({ data: jogo })
  }

  console.log(`✅ Created ${jogos.length} games`)
  console.log('💡 Tip: set role=ADMIN on your user after first login:')
  console.log(
    "   UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your@email.com';"
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
