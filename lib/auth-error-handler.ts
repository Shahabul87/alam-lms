import { signOut } from "next-auth/react";

export const handleSessionError = (error: any) => {
  if (error?.message?.includes('Failed to fetch')) {
    console.error('Session fetch error:', error);
    return true;
  }
  return false;
};

export const refreshSession = async () => {
  try {
    // Clear session and redirect to login
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  } catch (error) {
    console.error('Error refreshing session:', error);
    // Force reload as fallback
    window.location.href = '/auth/login';
  }
}; 