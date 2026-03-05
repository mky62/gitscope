"use client";

import { useCallback, useState } from "react";
import { useSignIn } from "@clerk/nextjs";

import type { OAuthProvider } from "@/lib/types";

type OAuthLoading = OAuthProvider | null;

function toErrorMessage(e: unknown, fallback = "Sign-in failed."): string {
  if (typeof e === "object" && e !== null && "message" in e) {
    return String((e as { message?: unknown }).message) || fallback;
  }
  return fallback;
}

export function useHandleAuth() {
  const { signIn, isLoaded }: any = useSignIn();
  const [oauthLoading, setOauthLoading] = useState<OAuthLoading>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = useCallback(
    async (provider: OAuthProvider) => {
      setError(null);

      if (!isLoaded) return;

      if (provider !== "github") {
        setError("Only GitHub sign-in is supported.");
        return;
      }

      try {
        setOauthLoading(provider);
        await signIn!.authenticateWithRedirect({
          strategy: `oauth_${provider}`,
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/dashboard",
        });
      } catch (e) {
        setOauthLoading(null);
        setError(toErrorMessage(e));
      }
    },
    [isLoaded, signIn]
  );

  return { oauthLoading, error, handleOAuth };
}