"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Bell, 
  HelpCircle,
  Bookmark,
  Award,
  Gift,
  CreditCard,
  MessageCircle,
  UserCog,
  ShieldCheck,
  Users
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import Image from "next/image";

interface UserMenuProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export const UserMenu = ({ user }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dashboardLink = user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/user";
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuSections = [
    {
      title: "Navigation",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", link: dashboardLink },
        { icon: User, label: "My Profile", link: "/profile" },
        { icon: Bookmark, label: "My Courses", link: "/my-courses" },
        { icon: MessageCircle, label: "My Posts", link: "/my-posts" },
        { icon: Users, label: "My Study Groups", link: "/groups" },
      ]
    },
    {
      title: "Account",
      items: [
        { icon: Settings, label: "Settings", link: "/settings" },
        { icon: Bell, label: "Notifications", link: "/notifications" },
        { icon: CreditCard, label: "Billing", link: "/billing" },
      ]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", link: "/help" },
        { icon: MessageCircle, label: "Contact Support", link: "/support" },
      ]
    }
  ];

  const getAvatarFallback = (name?: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // CSS for user menu hover effect
  const menuHoverStyles = `
    .user-avatar-container {
      position: relative;
    }
    .user-info-tooltip {
      position: fixed;
      right: 16px;
      top: 64px;
      width: 256px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px) scale(0.95);
      transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
      z-index: 999;
    }
    .user-avatar-container:hover .user-info-tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }
  `;

  return (
    <div className="relative hidden md:block" ref={menuRef}>
      <style jsx>{menuHoverStyles}</style>
      
      {/* User Avatar with CSS Hover Effect */}
      <div className="user-avatar-container">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center justify-center"
          aria-label="User menu"
          style={{ position: "relative", zIndex: 998 }}
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/50 hover:border-purple-400 transition-all duration-200 shadow-md hover:shadow-purple-500/20">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {getAvatarFallback(user?.name)}
              </div>
            )}
            
            {/* Status indicator */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
        </button>
        
        {/* CSS-based Hover Tooltip (no React state needed) */}
        <div className="user-info-tooltip p-4 rounded-lg bg-gray-900/95 backdrop-blur-sm border border-gray-800/80 shadow-xl overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-md flex-shrink-0">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {getAvatarFallback(user?.name)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.name || "User"}</p>
              <p className="text-gray-400 text-sm truncate">{user?.email || "No email"}</p>
              <p className="text-purple-400 text-xs mt-1">
                {user?.role === "ADMIN" ? "Administrator" : "Member"}
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-800/70">
            <p className="text-xs text-gray-400">Click to open menu options</p>
          </div>
        </div>
      </div>

      {/* Full Menu on Click */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for menu */}
            <div className="fixed inset-0 z-[998]" />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed right-4 top-16 w-80 rounded-xl bg-gray-900/95 backdrop-blur-sm border border-gray-800/80 shadow-2xl overflow-hidden z-[999]"
              style={{ position: "fixed", zIndex: 999 }}
            >
              {/* User Profile Header */}
              <div className="p-4 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-b border-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/50 shadow-lg">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User"}
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        {getAvatarFallback(user?.name)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">{user?.name || "User"}</h3>
                    <p className="text-gray-300 text-sm">{user?.email || ""}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {user?.role === "ADMIN" ? (
                          <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1" /> Admin</span>
                        ) : (
                          <span className="flex items-center"><Award className="w-3 h-3 mr-1" /> Member</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Link href="/profile" className="mt-3 w-full flex items-center justify-center">
                  <motion.button
                    whileHover={{ y: -2 }}
                    className="text-xs text-center py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                  >
                    View Profile
                  </motion.button>
                </Link>
              </div>

              {/* Menu Items */}
              <div className="max-h-[350px] overflow-y-auto py-2 custom-scrollbar">
                {menuSections.map((section, index) => (
                  <div key={section.title} className={index !== 0 ? "mt-2 pt-2 border-t border-gray-800/50" : ""}>
                    <p className="px-4 py-1 text-xs text-gray-500 uppercase tracking-wider font-medium">
                      {section.title}
                    </p>
                    
                    {section.items.map((item) => (
                      <Link key={item.label} href={item.link}>
                        <motion.div
                          whileHover={{ x: 5, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                          className="flex items-center px-4 py-2.5 text-gray-300 hover:text-white transition-colors cursor-pointer group"
                        >
                          <div className="w-8 h-8 mr-3 rounded-lg bg-gray-800/70 flex items-center justify-center group-hover:bg-indigo-600/30 transition-colors">
                            <item.icon className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
                          </div>
                          <span className="font-medium text-sm">{item.label}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>

              {/* Logout Button */}
              <div className="py-2 px-4 border-t border-gray-800/70 bg-gray-950/50">
                <LogoutButton className="w-full">
                  <motion.div
                    whileHover={{ x: 5, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                    className="flex items-center px-4 py-2.5 text-red-400 hover:text-red-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 mr-3 rounded-lg bg-red-900/20 flex items-center justify-center">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">Sign Out</span>
                  </motion.div>
                </LogoutButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};