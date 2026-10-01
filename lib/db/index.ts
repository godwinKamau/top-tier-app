import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let cached: NeonHttpDatabase<typeof schema> | null = null;

/**
 * Built on first use rather than at module scope, for the same reason
 * getResend() is in app/api/sendEmail/route.ts: the driver throws on a missing
 * or malformed connection string, and at module scope that throw takes down
 * every route that imports it — including the public landing page — with an
 * HTML error page instead of something a caller can handle.
 *
 * Returns null when DATABASE_URL is unset so callers decide what a missing
 * database means for them. The apply form treats it as non-fatal; the dashboard
 * treats it as an error worth showing.
 */
export function getDb(): NeonHttpDatabase<typeof schema> | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  cached ??= drizzle(url, { schema });
  return cached;
}
