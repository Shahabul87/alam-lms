import { handlers } from "@/auth";

// Force this route to use Node.js runtime, not Edge
export const runtime = 'nodejs';

// Export the handlers directly - NextAuth already has error handling internally
export const { GET, POST } = handlers;