// Core types matching the Prisma schema

// Shared return shape for Server Actions used with useActionState.
export interface FormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export type UserRole = 'sponsor' | 'publisher';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  budget: number;
  spent: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate: string;
  endDate: string;
  sponsorId: string;
  sponsor?: { id: string; name: string };
}

export interface AdSlot {
  id: string;
  name: string;
  description?: string;
  type: 'DISPLAY' | 'VIDEO' | 'NEWSLETTER' | 'PODCAST';
  basePrice: number;
  isAvailable: boolean;
  publisherId: string;
  publisher?: { id: string; name: string };
}

export interface Placement {
  id: string;
  impressions: number;
  clicks: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  campaignId: string;
  adSlotId: string;
}
