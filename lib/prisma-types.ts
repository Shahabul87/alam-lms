import { UserRole as PrismaUserRole } from "@prisma/client";

// Re-export the UserRole enum from Prisma
export type UserRole = PrismaUserRole;

// Add any additional types that were in the original file but are still needed 