/**
 * Safely verifies a password without using Node.js APIs that are incompatible with Edge Runtime
 * This handles password verification in a way that works in both server and edge environments
 */

// Check if we're in Edge Runtime
const isEdgeRuntime = typeof (globalThis as any).EdgeRuntime !== 'undefined';

export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    // If we're in Edge Runtime, we can't use bcryptjs
    if (isEdgeRuntime) {
      console.warn('Password verification skipped - Edge Runtime detected');
      return false;
    }

    // Use dynamic import to avoid static analysis detection
    // This creates a function that will be called only at runtime
    const importBcrypt = async () => {
      return await import('bcryptjs');
    };
    
    const { default: bcrypt } = await importBcrypt();
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    // If bcryptjs fails to load or compare (e.g., in Edge Runtime)
    console.warn('Password verification failed - incompatible environment:', error);
    return false;
  }
}

/**
 * Hash a password - only works in Node.js runtime
 */
export const hashPassword = async (password: string): Promise<string | null> => {
  try {
    if (isEdgeRuntime) {
      console.warn('Password hashing skipped - Edge Runtime detected');
      return null;
    }

    const { default: bcrypt } = await import('bcryptjs');
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.warn('Password hashing failed:', error);
    return null;
  }
} 