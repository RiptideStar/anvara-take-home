'use server';

import { revalidatePath } from 'next/cache';
import { backendFetch } from '@/lib/server-api';
import type { FormState } from '@/lib/types';

const DASHBOARD = '/dashboard/sponsor';

interface CampaignFields {
  name: string;
  description: string;
  budget: string;
  startDate: string;
  endDate: string;
  status: string;
}

function parseCampaignForm(formData: FormData): CampaignFields {
  return {
    name: String(formData.get('name') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    budget: String(formData.get('budget') ?? '').trim(),
    startDate: String(formData.get('startDate') ?? '').trim(),
    endDate: String(formData.get('endDate') ?? '').trim(),
    status: String(formData.get('status') ?? '').trim(),
  };
}

function validateCampaign(f: CampaignFields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!f.name) errors.name = 'Name is required';

  const budget = Number(f.budget);
  if (!f.budget || !Number.isFinite(budget) || budget <= 0) {
    errors.budget = 'Budget must be a positive number';
  }
  if (!f.startDate) errors.startDate = 'Start date is required';
  if (!f.endDate) errors.endDate = 'End date is required';
  if (f.startDate && f.endDate && new Date(f.endDate) < new Date(f.startDate)) {
    errors.endDate = 'End date must be on or after the start date';
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

export async function createCampaignAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const fields = parseCampaignForm(formData);
  const fieldErrors = validateCampaign(fields);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const res = await backendFetch('/api/campaigns', {
    method: 'POST',
    body: JSON.stringify({
      name: fields.name,
      description: fields.description || undefined,
      budget: Number(fields.budget),
      startDate: fields.startDate,
      endDate: fields.endDate,
    }),
  });
  if (!res.ok) return { error: await readError(res) };

  revalidatePath(DASHBOARD);
  return { success: true };
}

export async function updateCampaignAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing campaign id' };

  const fields = parseCampaignForm(formData);
  const fieldErrors = validateCampaign(fields);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const res = await backendFetch(`/api/campaigns/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: fields.name,
      description: fields.description || undefined,
      budget: Number(fields.budget),
      startDate: fields.startDate,
      endDate: fields.endDate,
      ...(fields.status ? { status: fields.status } : {}),
    }),
  });
  if (!res.ok) return { error: await readError(res) };

  revalidatePath(DASHBOARD);
  return { success: true };
}

export async function deleteCampaignAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing campaign id' };

  const res = await backendFetch(`/api/campaigns/${id}`, { method: 'DELETE' });
  if (!res.ok) return { error: await readError(res) };

  revalidatePath(DASHBOARD);
  return { success: true };
}
