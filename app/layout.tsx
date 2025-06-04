import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import './globals.css'
import clsx from "clsx";
import { auth } from '@/auth'
import { ConfettiProvider } from '@/components/providers/confetti-provider';
import { Providers } from "@/components/providers";
import { PageBackground } from '@/components/ui/page-background';
import { MainHeader } from './(homepage)/main-header';
import { SidebarContainer } from '@/components/ui/sidebar-container';
import { currentUser } from '@/lib/auth';
import LayoutWithSidebar from '@/components/layout/layout-with-sidebar';
import ClientToaster from '@/components/client-toaster';
import { Suspense } from 'react';

// Force dynamic rendering for the entire app
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] })

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'bdgenai',
  description: 'Learn with Shahabul Alam',
}

// Header Loading Fallback Component
function HeaderFallback() {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-[50] bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full relative overflow-hidden">
        <div className="flex justify-between items-center h-16 relative">
          {/* Logo */}
          <div className="flex items-center space-x-2 pl-8 md:pl-0">
            <div className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 bg-purple-400 rounded animate-pulse" />
            <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
              bdGenAI
            </span>
          </div>
          
          {/* Right side skeleton */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="w-8 h-8 bg-slate-800/80 rounded-lg animate-pulse"></div>
            <div className="w-8 h-8 bg-slate-800/80 rounded-lg animate-pulse"></div>
            <div className="hidden md:flex space-x-2">
              <div className="w-16 h-8 bg-slate-700 rounded-lg animate-pulse"></div>
              <div className="w-16 h-8 bg-slate-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// Async Header Component
async function AsyncHeader() {
  let user;
  
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Error fetching user:", error);
    user = null;
  }

  return <MainHeader user={user} />;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use try-catch to handle any errors with auth()
  let session;
  
  try {
    session = await auth();
  } catch (error) {
    console.error("Error fetching auth session:", error);
    session = null;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          rel="preload" 
          href="/_next/static/css/app/layout.css" 
          as="style"
        />
      </head>
      <body className={clsx(
        dmSans.className,
        "min-h-screen transition-colors duration-300"
      )}>
        <Providers session={session}>
          <ConfettiProvider />
          <ClientToaster />
          <PageBackground>
            {/* Fixed header with suspense boundary */}
            <div className="fixed top-0 left-0 right-0 z-[50]">
              <Suspense fallback={<HeaderFallback />}>
                <AsyncHeader />
              </Suspense>
            </div>
            
            {/* Main layout with sidebar and content */}
            <Suspense fallback={
              <div className="pt-16 min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
              </div>
            }>
              <LayoutWithSidebar user={null}>
                {children}
              </LayoutWithSidebar>
            </Suspense>
          </PageBackground>
        </Providers>
      </body>
    </html>
  )
}
