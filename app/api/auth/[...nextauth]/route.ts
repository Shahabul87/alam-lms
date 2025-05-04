import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";
import { db } from "@/lib/db";

// Force this route to use Node.js runtime, not Edge
export const runtime = 'nodejs';

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };

// Remove the duplicate authOptions from this file if it exists