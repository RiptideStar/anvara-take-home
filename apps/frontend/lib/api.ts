// Simple API client
import type { Campaign, AdSlot, Placement } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    // Surface the API's error message when present, instead of a generic failure.
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

// Campaigns
export const getCampaigns = (sponsorId?: string): Promise<Campaign[]> =>
  api<Campaign[]>(sponsorId ? `/api/campaigns?sponsorId=${sponsorId}` : '/api/campaigns');
export const getCampaign = (id: string): Promise<Campaign> => api<Campaign>(`/api/campaigns/${id}`);
export const createCampaign = (data: Partial<Campaign>): Promise<Campaign> =>
  api<Campaign>('/api/campaigns', { method: 'POST', body: JSON.stringify(data) });
// TODO: Add updateCampaign and deleteCampaign functions

// Ad Slots
export const getAdSlots = (publisherId?: string): Promise<AdSlot[]> =>
  api<AdSlot[]>(publisherId ? `/api/ad-slots?publisherId=${publisherId}` : '/api/ad-slots');
export const getAdSlot = (id: string): Promise<AdSlot> => api<AdSlot>(`/api/ad-slots/${id}`);
export const createAdSlot = (data: Partial<AdSlot>): Promise<AdSlot> =>
  api<AdSlot>('/api/ad-slots', { method: 'POST', body: JSON.stringify(data) });
// TODO: Add updateAdSlot, deleteAdSlot functions

// Placements
export const getPlacements = (): Promise<Placement[]> => api<Placement[]>('/api/placements');
export const createPlacement = (data: Partial<Placement>): Promise<Placement> =>
  api<Placement>('/api/placements', { method: 'POST', body: JSON.stringify(data) });

// Dashboard
export const getStats = (): Promise<unknown> => api<unknown>('/api/dashboard/stats');
