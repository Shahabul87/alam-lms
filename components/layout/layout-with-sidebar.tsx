"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarContainer } from "@/components/ui/sidebar-container";
import clsx from "clsx";

interface LayoutWithSidebarProps {
  user: any;
  children: React.ReactNode;
}

// Routes where the sidebar should be hidden
const SIDEBAR_HIDDEN_ROUTES = [
  "/", // Homepage
  "/about",
  "/features",
  "/blog",
  "/support",
];

export default function LayoutWithSidebar({ user, children }: LayoutWithSidebarProps) {
  const pathname = usePathname();
  const shouldShowSidebar = !SIDEBAR_HIDDEN_ROUTES.includes(pathname);
  const hasUser = !!user;
  const showSidebar = hasUser && shouldShowSidebar;

  return (
    <div className="flex h-screen pt-16">
      {/* Conditional sidebar */}
      {showSidebar && (
        <div className="fixed top-16 left-0 bottom-0 h-[calc(100vh-4rem)] z-40">
          <SidebarContainer user={user} />
        </div>
      )}
      
      {/* Main content with conditional margin */}
      <main
        className={clsx(
          "flex-1 overflow-y-auto h-[calc(100vh-4rem)] pt-2 px-4",
          showSidebar ? "ml-[80px]" : ""
        )}
      >
        {children}
      </main>
    </div>
  );
} 