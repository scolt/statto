import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";
import { ensureUserAndPlayer } from "@/lib/auth/user-management";

/**
 * Auth0 client for server components
 * Configuration is read from environment variables:
 * AUTH0_SECRET, AUTH0_BASE_URL, AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET
 */
export const auth0 = new Auth0Client({
  async onCallback(error, ctx, session) {
    if (error) {
      console.error("Auth0 callback error:", error);
      return NextResponse.redirect(new URL("/", process.env.APP_BASE_URL));
    }

    // Create user and player records immediately after first login
    if (session?.user) {
      try {
        await ensureUserAndPlayer(session.user);
      } catch (err) {
        console.error("Failed to create user/player on login:", err);
        // Don't block login — the user can still use the app
      }
    }

    // Redirect to the return URL or home page
    return NextResponse.redirect(new URL(ctx.returnTo || "/", process.env.APP_BASE_URL));
  },
});

/**
 * Helper function to get the current authenticated user
 * Use in server components/actions
 */
export async function getCurrentUser() {
  const session = await auth0.getSession();
  return session?.user || null;
}

