"use client"

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Sun,
  Moon,
  Search,
  LogIn,
  UserPlus,
  Menu,
  X
} from 'lucide-react';

// Component imports
import { MobileMenuButton } from './components/mobile-menu-button';
import { NotificationsPopover } from './_components/notifications-popover';
import { MessagesPopover } from './_components/messages-popover';
import { UserMenu } from './_components/user-menu';
import { SearchOverlay } from './components/search-overlay';

// Types and utils
import { HeaderAfterLoginProps, SearchResult } from './types/header-types';
import { highlightMatches } from './utils/search-utils';
import { useSearch } from './hooks/useSearch';

export const HeaderAfterLogin = ({ user }: HeaderAfterLoginProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  
  // Use the custom search hook
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    isSearching, 
    searchError, 
    performSearch,
    clearSearch 
  } = useSearch();

  const dashboardLink = user?.role === "ADMIN" ? "/dashboard/admin" : "/user";
  const isAuthenticated = !!user?.id;

  useEffect(() => {
    setIsMounted(true);
    console.log("Header component mounted, authenticated:", isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    // Add click outside listener to close search when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node) &&
        isSearchOpen
      ) {
        setIsSearchOpen(false);
        clearSearch();
      }
    };

    // Focus input when search is opened
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      console.log("Search opened, input focused");
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen, clearSearch]);

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
    console.log("Search icon clicked, opening search");
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    clearSearch();
    console.log("Search closed");
  };

  const navigateToResult = (result: SearchResult) => {
    const path = result.type === 'course' ? `/courses/${result.id}` : `/blog/${result.id}`;
    console.log("Navigating to:", path);
    router.push(path);
    handleCloseSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If user presses Enter, perform search immediately
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      console.log("Enter key pressed, performing search");
      performSearch().catch(err => {
        console.error("Search error when pressing Enter:", err);
      });
    }
    // If user presses Escape, close search
    if (e.key === 'Escape') {
      console.log("Escape key pressed, closing search");
      handleCloseSearch();
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 dark:bg-gray-900/90 bg-white/90 backdrop-blur-sm dark:border-gray-800 border-gray-200 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 pl-8 md:pl-0">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-500" />
              <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
                bdGenAI
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-3 lg:space-x-6">
              <Link href="/features" className="text-sm lg:text-base dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="/discover" className="text-sm lg:text-base dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors">
                Discover
              </Link>
              <Link href="/about" className="text-sm lg:text-base dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="/blog" className="text-sm lg:text-base dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors">
                Blog
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Search Icon */}
              <button
                onClick={handleSearchIconClick}
                className="p-1.5 md:p-2 rounded-lg dark:bg-gray-800 bg-gray-100 dark:hover:bg-gray-700 hover:bg-gray-200 transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-500 dark:text-gray-400" />
              </button>
              
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 md:p-2 rounded-lg dark:bg-gray-800 bg-gray-100 dark:hover:bg-gray-700 hover:bg-gray-200 transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                )}
              </button>

              {/* Authenticated User Actions */}
              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-2 lg:gap-4">
                  <NotificationsPopover />
                  <MessagesPopover />
                  <UserMenu user={user} />
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
                  <Link href="/auth/login">
                    <motion.div
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </motion.div>
                  </Link>
                  <Link href="/auth/register">
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </motion.div>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                {isAuthenticated ? (
                  <MobileMenuButton 
                    isOpen={isOpen} 
                    setIsOpen={setIsOpen}
                    dashboardLink={dashboardLink}
                  />
                ) : (
                  <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-lg dark:bg-gray-800/80 bg-gray-100/80 dark:hover:bg-gray-700 hover:bg-gray-200 transition-colors dark:text-white text-gray-900"
                    aria-label="Toggle menu"
                  >
                    {isOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu for Unauthenticated Users */}
      {!isAuthenticated && isOpen && (
        <div className="fixed top-16 left-0 right-0 w-full md:hidden overflow-hidden z-40 shadow-lg dark:bg-gray-900/95 bg-white/95 backdrop-blur-sm dark:border-gray-800 border-gray-200 border-b">
          <div className="px-4 py-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav className="flex flex-col items-center space-y-3">
              <Link href="/features" className="dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors text-center w-full">
                Features
              </Link>
              <Link href="/discover" className="dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors text-center w-full">
                Discover
              </Link>
              <Link href="/about" className="dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors text-center w-full">
                About
              </Link>
              <Link href="/blog" className="dark:text-gray-300 text-gray-600 dark:hover:text-white hover:text-gray-900 transition-colors text-center w-full">
                Blog
              </Link>
              <div className="flex flex-col items-center space-y-3 pt-3 dark:border-gray-800 border-gray-200 border-t w-full">
                <Link href="/auth/login" className="w-full max-w-[200px]">
                  <motion.div className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors w-full">
                    <LogIn className="w-4 h-4" />
                    <span className="font-medium">Login</span>
                  </motion.div>
                </Link>
                <Link href="/auth/register" className="w-full max-w-[200px]">
                  <motion.div className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-colors w-full">
                    <UserPlus className="w-4 h-4" />
                    <span className="font-medium">Sign Up</span>
                  </motion.div>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Search Overlay Component */}
      <SearchOverlay
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        searchContainerRef={searchContainerRef}
        searchInputRef={searchInputRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleKeyDown={handleKeyDown}
        handleCloseSearch={handleCloseSearch}
        isSearching={isSearching}
        searchResults={searchResults}
        searchError={searchError}
        navigateToResult={navigateToResult}
        highlightMatches={highlightMatches}
        performSearch={performSearch}
      />
      
      {/* Debug info (visible in development only) */}
      {process.env.NODE_ENV === 'development' && searchError && (
        <div className="fixed bottom-4 right-4 bg-red-100 dark:bg-red-900 p-4 rounded-lg shadow-lg z-50">
          <p className="text-red-700 dark:text-red-200 font-medium">Search Error:</p>
          <p className="text-red-600 dark:text-red-300">{searchError}</p>
        </div>
      )}
    </>
  );
};

