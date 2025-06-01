import { db } from "@/lib/db";

// Simple in-memory cache to reduce database calls
const userCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getUserByEmail = async (email: string) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Looking up user with email: ${email}`);
    }
    const user = await db.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isTwoFactorEnabled: true,
        emailVerified: true,
        image: true
      }
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`User lookup result: ${user ? 'Found' : 'Not found'}`);
      
      // Debug password field if user exists
      if (user) {
        console.log(`Password field exists: ${!!user.password}`);
        console.log(`Password length: ${user.password ? user.password.length : 0}`);
        
        // Check for potential corruption in the password hash
        if (user.password && (
            user.password.length < 50 || // bcrypt hashes are typically 60 chars
            !user.password.startsWith('$2') // bcrypt hashes start with $2a$ or similar
        )) {
          console.warn("Warning: Password hash may be corrupted");
        }
      }
    }

    return user;
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    // Check cache first
    const cached = userCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.user;
    }

    // Only log in development to reduce noise
    if (process.env.NODE_ENV === 'development') {
      console.log(`Looking up user with id: ${id}`);
    }
    
    const user = await db.user.findUnique({ 
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        image: true,
        isTwoFactorEnabled: true
      }
    });
    
    // Cache the result
    if (user) {
      userCache.set(id, { user, timestamp: Date.now() });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`User id lookup result: ${user ? 'Found' : 'Not found'}`);
    }
    
    return user;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
};

// Clean up cache periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of userCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        userCache.delete(key);
      }
    }
  }, CACHE_DURATION);
}