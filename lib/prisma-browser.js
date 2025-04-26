// This file provides empty implementations for Prisma client in browser environments
// It's used by Next.js to avoid errors when importing @prisma/client in client components

// Mock PrismaClient
class PrismaClient {
  constructor() {
    return new Proxy({}, {
      get: () => () => {
        throw new Error('PrismaClient cannot be used in browser environments');
      }
    });
  }
}

// Export all the types and enums from our safe implementation
module.exports = {
  PrismaClient,
  Prisma: { 
    // Defines basic Prisma namespace
  }
};

// Export all available Prisma enums as empty objects
// These will be replaced by our actual enum values from prisma-types.ts
module.exports.UserRole = {};
module.exports.ReactionType = {};
module.exports.BillCategory = {};
module.exports.BillStatus = {};
module.exports.RecurringType = {}; 