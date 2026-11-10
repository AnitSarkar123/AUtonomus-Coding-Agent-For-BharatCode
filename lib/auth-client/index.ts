"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
});

export const { useSession, signIn, signOut, signUp } = authClient;

export function useAuth() {
  const { data: session, isPending } = useSession();
  
  return {
    user: session?.user,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    signIn: authClient.signIn,
    signOut: authClient.signOut,
  };
}