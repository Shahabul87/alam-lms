import { db } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
  try {
    console.log(`Looking up user with email: ${email}`);
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

    return user;
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    console.log(`Looking up user with id: ${id}`);
    const user = await db.user.findUnique({ where: { id } });
    
    console.log(`User id lookup result: ${user ? 'Found' : 'Not found'}`);
    return user;
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
};