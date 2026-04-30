// prisma/seed.ts — Prontuário Social
// Run: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
// Or via: npx prisma db seed

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

async function main() {
  console.log('🌱 Iniciando seed do Prontuário Social...')

  // -------------------------------------------------------
  // USERS
  // -------------------------------------------------------
  const passwordHash = await bcrypt.hash('senha@123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@prontuario.gov.br' },
    update: {},
    create: {
      name: 'Administrador Sistema',
      email: 'admin@prontuario.gov.br',
      password: passwordHash,
      role: 'admin',
      ubs: 'UBS Central',
      active: true,
    },
  })

  const gestor = await prisma.user.upsert({
    where: { email: 'gestor@prontuario.gov.br' },
    update: {},
    create: {
      name: 'Marcos Oliveira',
      email: 'gestor@prontuario.gov.br',
      password: passwordHash,
      role: 'gestor',
      ubs: 'UBS Central',
      active: true,
    },
  })

  const agente = await prisma.user.upsert({
    where: { email: 'agente@prontuario.gov.br' },
    update: {},
    create: {
      name: 'Ana Carvalho',
      email: 'agente@prontuario.gov.br',
      password: passwordHash,
      role: 'agente_saude',
      ubs: 'UBS Central',
      active: true,
    },
  })

  console.log('✅ Usuários criados')

  // -------------------------------------------------------
  // CITIZENS (10 demo)
  // -------------------------------------------------------

  const CITIZENS_DATA = [
    {
      cns: '700 0000 0000 001',
      cpf: '11122233344',
      name: 'Maria das Graças Silva',
      sex: 'F',
      dateOfBirth: new Date('1956-03-12'),
      ubs: 'UBS Central',
      territory: 'Vila Nova - Setor 04',
      vulnScore: 78,
      vulnCategory: 'critico',
    },
    {
      cns: '700 0000 0000 002',
      cpf: '22233344455',
      name: 'João Paulo Rodrigues',
      sex: 'M',
      dateOfBirth: new Date('1982-07-25'),
      ubs: 'UBS Central',
      territory: 'Jardim América',
      vulnScore: 32,
      vulnCategory: 'baixo',
    },
    {
      cns: '700 0000 0000 003',
      cpf: '33344455566',
      name: 'Luciana Pereira Gomes',
      sex: 'F',
      dateOfBirth: new Date('1995-11-08'),
      ubs: 'UBS Central',
      territory: 'Vila Esperança',
      vulnScore: 55,
      vulnCategory: 'medio',
    },
    {
      cns: '700 0000 0000 004',
      cpf: '44455566677',
      name: 'Carlos Eduardo Mendes',
      sex: 'M',
      dateOfBirth: new Date('1948-05-30'),
      ubs: 'UBS Central',
      territory: 'Centro Histórico',
      vulnScore: 82,
      vulnCategory: 'critico',
    },
    {
      cns: '700 0000 0000 005',
      cpf: '55566677788',
      name: 'Fernanda Lima Santos',
      sex: 'F',
      dateOfBirth: new Date('1975-09-14'),
      ubs: 'UBS Central',
      territory: 'Liberdade',
      vulnScore: 65,
      vulnCategory: 'moderado_alto',
    },
    {
      cns: '700 0000 0000 006',
      cpf: '66677788899',
      name: 'Antônio José Costa',
      sex: 'M',
      dateOfBirth: new Date('1960-02-18'),
      ubs: 'UBS Central',
      territory: 'Vila Nova - Setor 04',
      vulnScore: 71,
      vulnCategory: 'moderado_alto',
    },
    {
      cns: '700 0000 0000 007',
      cpf: '77788899900',
      name: 'Priscila Albuquerque',
      sex: 'F',
      dateOfBirth: new Date('2001-06-22'),
      ubs: 'UBS Central',
      territory: 'Subúrbio Norte',
      vulnScore: 88,
      vulnCategory: 'critico',
    },
    {
      cns: '700 0000 0000 008',
      cpf: '88899900011',
      name: 'Roberto Ferreira Nunes',
      sex: 'M',
      dateOfBirth: new Date('1990-12-03'),
      ubs: 'UBS Central',
      territory: 'Jardim América',
      vulnScore: 28,
      vulnCategory: 'baixo',
    },
    {
      cns: '700 0000 0000 009',
      cpf: '99900011122',
      name: 'Margarida Souza Pinto',
      sex: 'F',
      dateOfBirth: new Date('1965-08-17'),
      ubs: 'UBS Central',
      territory: 'Liberdade',
      vulnScore: 60,
      vulnCategory: 'moderado_alto',
    },
    {
      cns: '700 0000 0000 010',
      cpf: '00011122233',
      name: 'Paulo Sérgio Alves',
      sex: 'M',
      dateOfBirth: new Date('1953-04-29'),
      ubs: 'UBS Central',
      territory: 'Centro Histórico',
      vulnScore: 45,
      vulnCategory: 'medio',
    },
  ]

  for (const data of CITIZENS_DATA) {
    const citizen = await prisma.citizen.upsert({
      where: { cns: data.cns },
      update: {},
      create: {
        cns: data.cns,
        cpf: data.cpf,
        name: data.name,
        sex: data.sex,
        dateOfBirth: data.dateOfBirth,
        ubs: data.ubs,
        territory: data.territory,
        active: true,
      },
    })

    // Vulnerability score
    await prisma.vulnerabilityScore.upsert({
      where: { citizenId: citizen.id },
      update: { score: data.vulnScore, category: data.vulnCategory },
      create: {
        citizenId: citizen.id,
        score: data.vulnScore,
        category: data.vulnCategory,
        factors: {
          housingQuality: Math.round((100 - data.vulnScore) * 0.8),
          incomeNormalized: Math.round((100 - data.vulnScore) * 0.6),
          sanitationNormalized: Math.round((100 - data.vulnScore) * 0.7),
          foodSecurityNormalized: Math.round((100 - data.vulnScore) * 0.9),
        },
      },
    })

    // Social record
    await prisma.socialRecord.upsert({
      where: { citizenId: citizen.id },
      update: {},
      create: {
        citizenId: citizen.id,
        housingQuality: Math.max(10, 100 - data.vulnScore),
        monthlyIncome: data.vulnScore > 70 ? 650 : data.vulnScore > 50 ? 1200 : 2500,
        sanitationLevel: data.vulnScore > 70 ? 2 : data.vulnScore > 50 ? 3 : 5,
        foodSecurity: data.vulnScore > 70 ? 1 : data.vulnScore > 50 ? 3 : 5,
        educationLevel: data.vulnScore > 70 ? 'fundamental' : 'medio',
        employmentStatus: data.vulnScore > 70 ? 'desempregado' : 'informal',
      },
    })

    // A visit record
    await prisma.visitRecord.create({
      data: {
        citizenId: citizen.id,
        workerId: agente.id,
        type: 'domiciliar',
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        notes: 'Visita de rotina realizada com sucesso.',
      },
    })

    // Risk alert for critical/high
    if (data.vulnScore >= 70) {
      await prisma.riskAlert.create({
        data: {
          citizenId: citizen.id,
          severity: data.vulnScore >= 80 ? 'critico' : 'alto',
          category: 'social',
          description: `Cidadão com score de vulnerabilidade ${data.vulnScore}/100 — requer acompanhamento prioritário.`,
        },
      })
    }

    // Clinical entry for adults
    if (data.dateOfBirth < new Date('1980-01-01')) {
      await prisma.clinicalEntry.create({
        data: {
          citizenId: citizen.id,
          cid10: 'I10',
          diagnosis: 'Hipertensão Arterial Sistêmica',
          diagnosedAt: new Date('2019-03-01'),
          status: 'em_acompanhamento',
          notes: 'Controle medicamentoso em andamento.',
        },
      })
    }
  }

  console.log('✅ 10 cidadãos criados com scores de vulnerabilidade, visitas e alertas')

  // -------------------------------------------------------
  // SAMPLE INTERVENTION
  // -------------------------------------------------------
  const mariaId = await prisma.citizen.findFirst({
    where: { cns: '700 0000 0000 001' },
    select: { id: true },
  })

  if (mariaId) {
    await prisma.intervention.create({
      data: {
        citizenId: mariaId.id,
        workerId: agente.id,
        title: 'Acompanhamento por situação de vulnerabilidade crítica',
        plan: 'Visitas semanais, encaminhamento ao CRAS, acompanhamento nutricional e habitacional.',
        status: 'em_andamento',
        followUps: [
          {
            date: new Date().toISOString(),
            note: 'Primeira visita realizada. Família em situação de insegurança alimentar severa.',
            workerId: agente.id,
            workerName: agente.name,
          },
        ],
      },
    })
  }

  console.log('✅ Intervenção de demonstração criada')
  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\nCredenciais de acesso:')
  console.log('  Admin:  admin@prontuario.gov.br / senha@123')
  console.log('  Gestor: gestor@prontuario.gov.br / senha@123')
  console.log('  Agente: agente@prontuario.gov.br / senha@123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
