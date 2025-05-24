"use client";
import { createClient } from "@/utils/supabase/client";
import { useCallback } from "react";

export default function LoginPage() {
  const handleLogin = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
      },
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleLogin}
      >
        Sign in with Google
      </button>
    </div>
  );
}
