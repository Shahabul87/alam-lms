import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { UserRole } from "@/lib/prisma-types";
import { AdminDashboardSkeleton } from "@/components/skeletons/admin-dashboard-skeleton";
import { ClientAdminDashboard } from "@/app/dashboard/admin/client";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for managing the learning platform",
};

// Auth protection
export default async function AdminPage() {
  const session = await auth();
  
  if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
    redirect("/auth/login");
  }
  
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <ClientAdminDashboard />
    </Suspense>
  );
} 