// Server-only API client. Forwards the incoming request's cookies to the
// backend so authenticated, session-scoped endpoints work from Server
// Components. Do not import this from Client Components.
import { headers } from 'next/headers';
import type { Campaign } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

async function serverFetch<T>(endpoint: string): Promise<T> {
  const incoming = await headers();
  const cookie = incoming.get('cookie') ?? '';

  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { cookie },
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `API request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body && typeof body.error === 'string') message = body.error;
    } catch {
      // Response had no JSON body; keep the generic message.
    }
    throw new Error(message);
  }

  return res.json();
}

// Campaigns are private; the backend scopes results to the authenticated sponsor.
export const getMyCampaigns = (): Promise<Campaign[]> => serverFetch<Campaign[]>('/api/campaigns');
