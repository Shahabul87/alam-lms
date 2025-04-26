// Re-export the prisma client from our centralized location
import prisma from './prisma';

// Export the db instance
export const db = prisma;

// For convenience, also export as prismadb
export const prismadb = prisma;

// Export as default
export default prisma;