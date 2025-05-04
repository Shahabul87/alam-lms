import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Importantly, we're preserving the existing db export API for compatibility

// Check if we're in a Node.js environment before trying to initialize
const isNode = typeof process !== 'undefined' && 
               process.versions != null && 
               process.versions.node != null;

function getPrismaClient() {
  if (!isNode) {
    // For Edge Runtime, return a mock or throw - depends on your needs
    console.warn("Attempting to initialize PrismaClient in non-Node environment");
    return new PrismaClient();
  }
  
  // For Node.js environment, properly initialize
  if (process.env.NODE_ENV === "production") {
    return new PrismaClient();
  } else {
    // In development, reuse the client if it exists
    if (!globalThis.prisma) {
      globalThis.prisma = new PrismaClient();
    }
    return globalThis.prisma;
  }
}

export const db = getPrismaClient(); 