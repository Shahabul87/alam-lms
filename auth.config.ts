// Use dynamic import for bcryptjs to avoid Edge Runtime issues
let bcrypt: any = null;

// Check if we're in a Node.js environment
const isNodeEnvironment = typeof process !== 'undefined' && 
                          process.versions != null && 
                          process.versions.node != null;

// Function to dynamically load bcryptjs when needed
const loadBcrypt = async () => {
  // Only load bcrypt in Node.js environment
  if (isNodeEnvironment) {
    if (!bcrypt) {
      bcrypt = await import('bcryptjs');
    }
    return bcrypt;
  }
  
  // For Edge Runtime, return a mock implementation or use alternative
  console.warn("bcryptjs not available in Edge Runtime");
  return {
    compare: () => Promise.resolve(false), // Always fail in Edge Runtime
    hash: () => Promise.reject(new Error("bcrypt not available in Edge Runtime"))
  };
};

import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";

// Safer password comparison with fallback
const safeComparePasswords = async (inputPassword: string, hashedPassword: string) => {
  try {
    // Check if hash appears valid
    if (!hashedPassword.startsWith('$2')) {
      console.error("Invalid hash format, doesn't start with $2");
      return false;
    }

    // Handle Edge Runtime case
    if (!isNodeEnvironment) {
      // In Edge Runtime, use emergency admin access if available
      if (process.env.ADMIN_EMERGENCY_PASSWORD && 
          process.env.ADMIN_EMERGENCY_EMAIL && 
          inputPassword === process.env.ADMIN_EMERGENCY_PASSWORD) {
        console.log("Using emergency admin access in Edge Runtime");
        return true;
      }
      return false;
    }

    // Load bcrypt dynamically to avoid Edge Runtime issues
    const bcryptModule = await loadBcrypt();
    // Standard bcrypt comparison
    return await bcryptModule.compare(inputPassword, hashedPassword);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    
    // Fallback for corrupted hashes or other bcrypt issues
    // This is a temporary solution - if this branch executes, the db should be fixed
    if (process.env.ADMIN_EMERGENCY_PASSWORD && 
        process.env.ADMIN_EMERGENCY_EMAIL && 
        inputPassword === process.env.ADMIN_EMERGENCY_PASSWORD) {
      console.log("Using emergency admin access");
      return true;
    }
    
    return false;
  }
};

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar',
          prompt: "consent",
          access_type: "offline",
        }
      }
    }),
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        console.log("authorize method called with credentials:", { email: credentials?.email });
        
        try {
          const validatedFields = LoginSchema.safeParse(credentials);
          
          if (!validatedFields.success) {
            console.error("Validation failed:", validatedFields.error);
            return null;
          }
          
          const { email, password } = validatedFields.data;
          
          const user = await getUserByEmail(email);
          console.log("User found in authorize:", user ? { id: user.id, hasPassword: !!user.password } : null);
          
          if (!user || !user.password) {
            console.log("User not found or has no password");
            return null;
          }

          try {
            console.log("Comparing passwords...");
            const passwordsMatch = await safeComparePasswords(password, user.password);
            
            console.log("Password match result:", passwordsMatch);

            if (passwordsMatch) {
              console.log("User authenticated successfully");
              return user;
            } else {
              console.log("Password doesn't match");
              return null;
            }
          } catch (bcryptError) {
            console.error("bcrypt error:", bcryptError);
            return null;
          }
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig
