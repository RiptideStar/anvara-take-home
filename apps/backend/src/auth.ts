import { betterAuth } from 'better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import { Pool } from 'pg';
import { type Request, type Response, type NextFunction } from 'express';
import { prisma } from './db.js';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Better Auth instance that shares the frontend's database and secret, so this
// backend can validate session cookies issued by the Next.js app.
export const auth = betterAuth({
  database: new Pool({ connectionString }),
  secret: process.env.BETTER_AUTH_SECRET || 'fallback-secret-for-dev',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3847',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  advanced: {
    disableCSRFCheck: true,
  },
});

export interface AuthUser {
  id: string;
  email: string;
  role: 'sponsor' | 'publisher' | null;
  sponsorId?: string;
  publisherId?: string;
}

// Make req.user available on the standard Express Request type.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Validates the Better Auth session on the incoming request, resolves the
 * user's sponsor/publisher identity, and attaches it to `req.user`.
 * Responds 401 when no valid session is present.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

    if (!session?.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Role + owning record are derived from the Sponsor/Publisher tables,
    // which link to the Better Auth user via userId.
    const [sponsor, publisher] = await Promise.all([
      prisma.sponsor.findUnique({ where: { userId: session.user.id }, select: { id: true } }),
      prisma.publisher.findUnique({ where: { userId: session.user.id }, select: { id: true } }),
    ]);

    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: sponsor ? 'sponsor' : publisher ? 'publisher' : null,
      sponsorId: sponsor?.id,
      publisherId: publisher?.id,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
}

/** Requires an authenticated sponsor. Run after requireAuth. */
export function requireSponsor(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.sponsorId) {
    res.status(403).json({ error: 'Sponsor account required' });
    return;
  }
  next();
}

/** Requires an authenticated publisher. Run after requireAuth. */
export function requirePublisher(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.publisherId) {
    res.status(403).json({ error: 'Publisher account required' });
    return;
  }
  next();
}
