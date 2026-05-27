'use server';

import { revalidatePath } from 'next/cache';
import { backendFetch } from '@/lib/server-api';
import type { FormState } from '@/lib/types';

const DASHBOARD = '/dashboard/publisher';
const AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'];

interface AdSlotFields {
  name: string;
  description: string;
  type: string;
  basePrice: string;
  isAvailable: boolean;
}

function parseAdSlotForm(formData: FormData): AdSlotFields {
  return {
    name: String(formData.get('name') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    type: String(formData.get('type') ?? '').trim(),
    basePrice: String(formData.get('basePrice') ?? '').trim(),
    isAvailable: formData.get('isAvailable') === 'on',
  };
}

function validateAdSlot(f: AdSlotFields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!f.name) errors.name = 'Name is required';
  if (!f.type || !AD_SLOT_TYPES.includes(f.type)) errors.type = 'Select a valid type';

  const price = Number(f.basePrice);
  if (!f.basePrice || !Number.isFinite(price) || price <= 0) {
    errors.basePrice = 'Base price must be a positive number';
  }
  return errors;
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body && typeof body.error === 'string') return body.error;
  } catch {
    // no JSON body
  }
  return `Request failed (${res.status})`;
}

export async function createAdSlotAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const fields = parseAdSlotForm(formData);
  const fieldErrors = validateAdSlot(fields);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const res = await backendFetch('/api/ad-slots', {
    method: 'POST',
    body: JSON.stringify({
      name: fields.name,
      description: fields.description || undefined,
      type: fields.type,
      basePrice: Number(fields.basePrice),
    }),
  });
  if (!res.ok) return { error: await readError(res) };

  revalidatePath(DASHBOARD);
  return { success: true };
}

export async function updateAdSlotAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing ad slot id' };

  const fields = parseAdSlotForm(formData);
  const fieldErrors = validateAdSlot(fields);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const res = await backendFetch(`/api/ad-slots/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: fields.name,
      description: fields.description || undefined,
      type: fields.type,
      basePrice: Number(fields.basePrice),
      isAvailable: fields.isAvailable,
    }),
  });
  if (!res.ok) return { error: await readError(res) };

  revalidatePath(DASHBOARD);
  return { success: true };
}

export async function deleteAdSlotAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing ad slot id' };

  const res = await backendFetch(`/api/ad-slots/${id}`, { method: 'DELETE' });
  if (!res.ok) return { error: await readError(res) };

  revalidatePath(DASHBOARD);
  return { success: true };
}
