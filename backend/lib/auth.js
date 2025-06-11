import { betterAuth } from "better-auth";

export const auth = betterAuth({
  trustedOrigins: process.env.TRUSTED_ORIGINS?.split(",") || [],
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
