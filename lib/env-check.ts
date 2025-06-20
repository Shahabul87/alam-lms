export function checkEnvironmentVariables() {
  const requiredVars = {
    // Auth
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    
    // OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    
    // Email
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    
    // App URL
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };

  const missing: string[] = [];
  const present: string[] = [];

  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    } else {
      present.push(key);
    }
  });

  console.log('=== Environment Variables Check ===');
  console.log('Present:', present);
  console.log('Missing:', missing);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    
    if (missing.includes('GOOGLE_CLIENT_ID') || missing.includes('GOOGLE_CLIENT_SECRET')) {
      console.warn('Google OAuth will not work without GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
    }
    
    if (missing.includes('GITHUB_CLIENT_ID') || missing.includes('GITHUB_CLIENT_SECRET')) {
      console.warn('GitHub OAuth will not work without GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET');
    }
    
    if (missing.includes('RESEND_API_KEY')) {
      console.warn('Email functionality will not work without RESEND_API_KEY');
    }
    
    if (missing.includes('AUTH_SECRET')) {
      console.error('AUTH_SECRET is required for NextAuth to work properly');
    }
  } else {
    console.log('✅ All environment variables are present');
  }

  return {
    missing,
    present,
    isComplete: missing.length === 0
  };
}

export function getAppUrl() {
  // Check for explicit URL environment variable first
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Check for Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Check for production environment
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    return 'https://bdgenai.com';
  }
  
  // Default to localhost for development
  return 'http://localhost:3000';
} 