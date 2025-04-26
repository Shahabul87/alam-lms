const { PrismaClient } = require('@prisma/client')

// This file ensures the Prisma Client can be instantiated more than once,
// which is necessary for Vercel deployment and serverless environments

const prismaClientSingleton = () => {
  return new PrismaClient()
}

const globalForPrisma = global
const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

module.exports = prisma 