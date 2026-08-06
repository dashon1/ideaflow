import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

// Extend express-session's SessionData so TypeScript knows about our token field.
declare module "express-session" {
  interface SessionData {
    csrfToken?: string;
  }
}

/** Returns the existing CSRF token for this session, creating one if absent. */
export function getOrCreateCsrfToken(req: any): string {
  if (!req.session?.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  return req.session.csrfToken as string;
}

/**
 * Middleware: reject state-changing requests that don't carry the correct
 * X-CSRF-Token header.  Apply to all POST / PATCH / PUT / DELETE routes
 * EXCEPT the Stripe webhook (which uses signature verification instead).
 */
export function verifyCsrf(req: Request, res: Response, next: NextFunction) {
  const headerToken = req.headers["x-csrf-token"];
  const sessionToken = (req as any).session?.csrfToken;

  if (!sessionToken || !headerToken || headerToken !== sessionToken) {
    return res.status(403).json({ message: "Invalid or missing CSRF token" });
  }
  next();
}
