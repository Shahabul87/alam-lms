"use client";

import { ThemeProvider } from "./providers/theme-provider";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";

// Create a custom auth provider that handles session fetch errors
const CustomAuthProvider = ({ children, session }: { children: ReactNode, session: any }) => {
  useEffect(() => {
    // Listen for fetch errors related to auth session
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes('Failed to fetch') || 
        event.error?.toString()?.includes('Failed to fetch')
      ) {
        console.error('Session fetch error detected:', event);
        // You could set up a retry mechanism or global error state here
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <SessionProvider session={session} refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </SessionProvider>
  );
};

export function Providers({ 
  children,
  session
}: { 
  children: React.ReactNode,
  session?: any
}) {
  return (
    <CustomAuthProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={true}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </CustomAuthProvider>
  );
} 