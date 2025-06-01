/**
 * Password utilities compatible with both Edge Runtime and Node.js
 * Uses @noble/hashes for new passwords and maintains backwards compatibility with bcrypt
 */

import { scrypt } from '@noble/hashes/scrypt';
import { randomBytes } from '@noble/hashes/utils';

// Utility to encode/decode base64
const encodeBase64 = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString('base64');
};

const decodeBase64 = (str: string): Uint8Array => {
  return new Uint8Array(Buffer.from(str, 'base64'));
};

/**
 * Hash a password using scrypt (works in all environments)
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    // Generate a random 16-byte salt
    const salt = randomBytes(16);
    
    // Hash with scrypt (N=16384, r=8, p=1, dkLen=32)
    const hash = scrypt(password, salt, { N: 16384, r: 8, p: 1, dkLen: 32 });
    
    // Format: noble:salt:hash (both base64 encoded)
    return `noble:${encodeBase64(salt)}:${encodeBase64(hash)}`;
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
};

/**
 * Verify a password against a hash (supports both noble/hashes and bcrypt formats)
 */
export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    // Check if it's a noble/hashes format
    if (hashedPassword.startsWith('noble:')) {
      return verifyNobleHash(plainPassword, hashedPassword);
    }
    
    // Check if it's a bcrypt format (starts with $2a$, $2b$, $2y$)
    if (hashedPassword.match(/^\$2[aby]\$/)) {
      return verifyBcryptHash(plainPassword, hashedPassword);
    }
    
    // If format is unknown, try noble first, then bcrypt
    try {
      return verifyNobleHash(plainPassword, hashedPassword);
    } catch {
      return verifyBcryptHash(plainPassword, hashedPassword);
    }
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
};

/**
 * Verify password against noble/hashes format
 */
const verifyNobleHash = (plainPassword: string, hashedPassword: string): boolean => {
  try {
    // Parse the hash format: noble:salt:hash
    const parts = hashedPassword.split(':');
    if (parts.length !== 3 || parts[0] !== 'noble') {
      throw new Error('Invalid noble hash format');
    }
    
    const salt = decodeBase64(parts[1]);
    const storedHash = decodeBase64(parts[2]);
    
    // Hash the plain password with the same salt
    const computedHash = scrypt(plainPassword, salt, { N: 16384, r: 8, p: 1, dkLen: 32 });
    
    // Constant-time comparison
    if (computedHash.length !== storedHash.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < computedHash.length; i++) {
      result |= computedHash[i] ^ storedHash[i];
    }
    
    return result === 0;
  } catch (error) {
    console.error('Noble hash verification failed:', error);
    return false;
  }
};

/**
 * Verify password against bcrypt format (backwards compatibility)
 * Only works in Node.js environment
 */
const verifyBcryptHash = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  try {
    // Check if we're in Edge Runtime
    const isEdgeRuntime = typeof (globalThis as any).EdgeRuntime !== 'undefined';
    
    if (isEdgeRuntime) {
      console.warn('Bcrypt verification skipped - Edge Runtime detected. Please rehash password with new format.');
      return false;
    }

    // Only import bcryptjs in Node.js environment and when actually needed
    const { default: bcrypt } = await import('bcryptjs');
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.warn('Bcrypt verification failed - incompatible environment or missing bcryptjs:', error);
    return false;
  }
};

/**
 * Utility to check if a password needs rehashing (bcrypt to noble)
 */
export const needsRehashing = (hashedPassword: string): boolean => {
  return !hashedPassword.startsWith('noble:');
};

/**
 * Migrate a user's password from bcrypt to noble/hashes format
 * Call this after successful login with old bcrypt hash
 */
export const migratePassword = async (plainPassword: string): Promise<string> => {
  return await hashPassword(plainPassword);
}; 