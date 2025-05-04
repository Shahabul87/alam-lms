import { PrismaClient } from '@prisma/client';

// This file provides a global Prisma instance for modules that
// need direct access to Prisma instead of the db wrapper

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// Check if we're in a Node.js environment
const isNodeEnvironment = typeof process !== 'undefined' && 
                          process.versions != null && 
                          process.versions.node != null;

if (!isNodeEnvironment) {
  // For Edge Runtime, create a new instance
  // This is not ideal but prevents errors in some cases
  prisma = new PrismaClient();
} else if (process.env.NODE_ENV === 'production') {
  // In production, create a new instance
  prisma = new PrismaClient();
} else {
  // In development, use cached instance to prevent connection leaks
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

export default prisma; 