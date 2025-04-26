import { PrismaClient } from '@prisma/client'

// This approach is recommended by Prisma to avoid multiple instances in development
// and to ensure proper client instantiation in production

declare global {
  var prisma: PrismaClient | undefined
}

// Use a global variable to prevent multiple instances in development
const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma 