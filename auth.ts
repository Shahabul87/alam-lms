import NextAuth from "next-auth"
import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getAccountByUserId } from "@/data/account";

export const { handlers: { GET, POST }, auth, signIn, signOut, } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      console.log("signIn callback triggered:", { 
        provider: account?.provider,
        userId: user?.id,
        email: user?.email 
      });
      
      if (account?.provider !== "credentials") {
        console.log("OAuth login, allowing sign in");
        return true;
      }
      
      if (!user.id) {
        console.log("No user ID, rejecting sign in");
        return false;
      }
      
      try {
        const existingUser = await getUserById(user.id);
        console.log("Existing user in signIn callback:", existingUser ? {
          id: existingUser.id,
          emailVerified: !!existingUser.emailVerified,
          isTwoFactorEnabled: existingUser.isTwoFactorEnabled
        } : null);

        if (!existingUser?.emailVerified) {
          console.log("Email not verified, rejecting sign in");
          return false;
        }

        if (existingUser.isTwoFactorEnabled) {
          console.log("2FA is enabled, checking confirmation");
          try {
            const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
            console.log("2FA confirmation:", !!twoFactorConfirmation);

            if (!twoFactorConfirmation) {
              console.log("No 2FA confirmation found, rejecting sign in");
              return false;
            }

            await db.twoFactorConfirmation.delete({
              where: { id: twoFactorConfirmation.id }
            });
            console.log("2FA confirmation deleted, allowing sign in");
          } catch (twoFactorError) {
            console.error("Error during 2FA check:", twoFactorError);
            return false;
          }
        }

        console.log("Authentication successful, allowing sign in");
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
        session.user.isOAuth = token.isOAuth as boolean;
      }
      //console.log(session)
      return session;
    },
    async jwt({ token }) {
      
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(
        existingUser.id
      );

      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      //console.log(token)
      return token;
    }
  },
  adapter: PrismaAdapter(db),
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  ...authConfig,
});