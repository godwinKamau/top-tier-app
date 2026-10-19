import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * The only thing in the codebase that knows how /berfday is guarded.
 *
 * Signing in to Clerk proves who someone is; it does not make them staff. Sign-up
 * is restricted in the Clerk instance, but a stray account (an accepted invite,
 * a dashboard slip) must still see nothing, so access is decided by the `users`
 * table: a row keyed by the Clerk user ID with role `admin`.
 */

export type DashboardAccess =
  | { status: "signed-out" }
  | { status: "forbidden" }
  | { status: "admin"; userId: string };

/**
 * Reading the Clerk session opts the calling page into dynamic rendering, which
 * keeps a gated page from being prerendered and cached as its signed-in version.
 *
 * Cached per request, since the admin layout and the page both ask.
 *
 * Throws when DATABASE_URL is unset: without the users table there is no way to
 * tell an admin from anyone else, so it fails closed as the error page.
 */
export const getDashboardAccess = cache(async (): Promise<DashboardAccess> => {
  const { userId } = await auth();
  if (!userId) return { status: "signed-out" };

  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is not set; /berfday cannot check roles.");

  const [row] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.clerkUserId, userId))
    .limit(1);

  return row?.role === "admin" ? { status: "admin", userId } : { status: "forbidden" };
});

/**
 * For Server Actions and Route Handlers, which are reachable by direct POST and
 * so must check for themselves rather than trust that the page was gated.
 * Returns the admin's Clerk user ID.
 */
export async function requireDashboard(): Promise<string> {
  const access = await getDashboardAccess();
  if (access.status !== "admin") throw new Error("Not authorized for /berfday.");
  return access.userId;
}
