"use client";

import { createAuthClient } from "better-auth/client";

export default function Login() {
  const authClient = createAuthClient({
    basePath: "/api/auth",
  });

  const signIn = async () => {
    const data = await authClient.signIn.social({
      provider: "google",

      callbackURL: window.location.origin,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <button
        onClick={signIn}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Sign in with Google
      </button>
    </div>
  );
}
