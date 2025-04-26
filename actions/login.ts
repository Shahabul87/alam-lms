"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import { db } from "@/lib/db";
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { 
  sendVerificationEmail,
  sendTwoFactorTokenEmail,
} from "@/lib/mail";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { 
  generateVerificationToken,
  generateTwoFactorToken
} from "@/lib/tokens";
import { 
  getTwoFactorConfirmationByUserId
} from "@/data/two-factor-confirmation";

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null,
) => {
  console.log("Login action called with:", { values, callbackUrl });
  
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error("Validation error:", validatedFields.error);
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  try {
    const existingUser = await getUserByEmail(email);
    console.log("Found user:", existingUser ? {
      id: existingUser.id,
      email: existingUser.email,
      emailVerified: existingUser.emailVerified,
      hasPassword: !!existingUser.password,
      isTwoFactorEnabled: existingUser.isTwoFactorEnabled
    } : null);

    if (!existingUser || !existingUser.email || !existingUser.password) {
      console.log("Invalid credentials - user not found or missing email/password");
      return { error: "Invalid credentials!" }
    }

    if (!existingUser.emailVerified) {
      console.log("Email not verified");
      const verificationToken = await generateVerificationToken(
        existingUser.email,
      );

      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token,
      );

      return { success: "Confirmation email sent!" };
    }

    if (existingUser.isTwoFactorEnabled && existingUser.email) {
      console.log("2FA is enabled, checking code");
      if (code) {
        const twoFactorToken = await getTwoFactorTokenByEmail(
          existingUser.email
        );

        if (!twoFactorToken) {
          return { error: "Invalid code!" };
        }

        if (twoFactorToken.token !== code) {
          return { error: "Invalid code!" };
        }

        const hasExpired = new Date(twoFactorToken.expires) < new Date();

        if (hasExpired) {
          return { error: "Code expired!" };
        }

        await db.twoFactorToken.delete({
          where: { id: twoFactorToken.id }
        });

        const existingConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );

        if (existingConfirmation) {
          await db.twoFactorConfirmation.delete({
            where: { id: existingConfirmation.id }
          });
        }

        await db.twoFactorConfirmation.create({
          data: {
            userId: existingUser.id,
          }
        });

        try {
          console.log("Attempting signIn with credentials after 2FA...");
          return await signIn("credentials", {
            email,
            password,
            redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
          });
        } catch (signInError) {
          console.error("SignIn error after 2FA:", signInError);
          return { error: "Authentication failed after 2FA validation" };
        }
      } else {
        try {
          console.log("Generating 2FA token for:", existingUser.email);
          const twoFactorToken = await generateTwoFactorToken(existingUser.email);
          console.log("Generated token:", twoFactorToken.token);
          
          await sendTwoFactorTokenEmail(
            twoFactorToken.email,
            twoFactorToken.token,
          );
          
          return { twoFactor: true };
        } catch (error) {
          console.error("2FA setup error:", error);
          return { error: "Failed to send verification code. Please try again." };
        }
      }
    }

    try {
      console.log("Attempting signIn with credentials...");
      return await signIn("credentials", {
        email,
        password,
        redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
      });
    } catch (signInError) {
      console.error("Direct SignIn error:", signInError);
      if (signInError instanceof AuthError) {
        switch (signInError.type) {
          case "CredentialsSignin":
            return { error: "Invalid credentials! Please check your email and password." }
          default:
            return { error: `Auth error: ${signInError.type}` }
        }
      }
      return { error: "Authentication failed. Check server logs for details." };
    }
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials! Authentication failed." }
        default:
          return { error: `Something went wrong! Error type: ${error.type}` }
      }
    }

    return { error: "An unexpected error occurred. Please try again later." };
  }
};