// This file exports Prisma types and enums that can be safely used
// in client components without triggering browser client imports

// UserRole enum definition (must match the schema)
export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN"
}

// ReactionType enum definition (must match the schema)
export enum ReactionType {
  LIKE = "LIKE",
  LAUGH = "LAUGH",
  HEART = "HEART",
  SAD = "SAD",
  ANGRY = "ANGRY"
}

// BillCategory enum definition (must match the schema)
export enum BillCategory {
  UTILITIES = "UTILITIES",
  RENT = "RENT",
  MORTGAGE = "MORTGAGE",
  GROCERIES = "GROCERIES",
  TRANSPORTATION = "TRANSPORTATION",
  EDUCATION = "EDUCATION",
  ENTERTAINMENT = "ENTERTAINMENT",
  HEALTHCARE = "HEALTHCARE",
  INSURANCE = "INSURANCE",
  OTHER = "OTHER"
}

// BillStatus enum definition (must match the schema)
export enum BillStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED"
}

// RecurringType enum definition (must match the schema)
export enum RecurringType {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY",
  NONE = "NONE"
} 