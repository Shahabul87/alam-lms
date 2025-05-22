"use client";

import { ThemeProvider } from "./providers/theme-provider";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";

// Create a custom auth provider that handles session fetch errors
const CustomAuthProvider = ({ children, session }: { children: ReactNode, session: any }) => {
  const [errorCount, setErrorCount] = useState(0);
  const [safeSession, setSafeSession] = useState(session);

  useEffect(() => {
    // Reset error count when session changes
    setErrorCount(0);
  }, [session]);

  useEffect(() => {
    const handleFetchError = async (event: ErrorEvent) => {
      if (event.message?.includes('Failed to fetch')) {
        setErrorCount(prev => prev + 1);
        
        // Implement exponential backoff for retries
        if (errorCount < 3) {
          const retryDelay = Math.pow(2, errorCount) * 1000; // 1s, 2s, 4s
          setTimeout(() => {
            // Force a session refresh
            window.location.reload();
          }, retryDelay);
        } else {
          // After 3 retries, clear session and redirect to login
          setSafeSession(null);
          window.location.href = '/auth/login';
        }
      }
    };

    window.addEventListener('error', handleFetchError);
    return () => window.removeEventListener('error', handleFetchError);
  }, [errorCount]);

  return (
    <SessionProvider 
      session={safeSession}
      refetchInterval={30 * 60} // Refetch every 30 minutes
      refetchOnWindowFocus={false}
    >
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