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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use try-catch to handle any errors with auth()
  let session;
  let user;
  
  try {
    session = await auth();
    user = await currentUser();
  } catch (error) {
    console.error("Error fetching auth session:", error);
    // Continue with null session/user if there's an error
    session = null;
    user = null;
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
            {/* Fixed header */}
            <div className="fixed top-0 left-0 right-0 z-[40]">
              <MainHeader user={user} />
            </div>
            
            {/* Main layout with sidebar and content */}
            <LayoutWithSidebar user={user}>
              {children}
            </LayoutWithSidebar>
          </PageBackground>
        </Providers>
      </body>
    </html>
  )
}
