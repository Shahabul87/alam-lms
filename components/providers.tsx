"use client";

import { ThemeProvider } from "./providers/theme-provider";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";

// Create a custom auth provider that handles session fetch errors
const CustomAuthProvider = ({ children, session }: { children: ReactNode, session: any }) => {
  const [errorCount, setErrorCount] = useState(0);
  const [safeSession, setSafeSession] = useState(session);

  useEffect(() => {
    // Validate and sanitize the session
    if (session) {
      try {
        // Try to JSON stringify and parse to ensure it's valid
        const validatedSession = JSON.parse(JSON.stringify(session));
        setSafeSession(validatedSession);
      } catch (e) {
        console.error("Invalid session data:", e);
        setSafeSession(null); // Use null session if invalid
      }
    }
  }, [session]);

  useEffect(() => {
    // Listen for fetch errors related to auth session
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes('Failed to fetch') || 
        event.error?.toString()?.includes('Failed to fetch') ||
        event.message?.includes('json') ||
        event.message?.includes('JSON')
      ) {
        console.error('Session fetch error detected:', event);
        setErrorCount(prev => prev + 1);
        
        // If we get too many errors, clear the session to prevent infinite loops
        if (errorCount > 3) {
          setSafeSession(null);
        }
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [errorCount]);

  return (
    <SessionProvider 
      session={safeSession} 
      refetchInterval={0} 
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
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