'use client';

import { useState } from 'react';
import { DeleteConfirm } from '@/app/components/delete-confirm';
import type { Campaign } from '@/lib/types';
import { CampaignFormModal } from './campaign-form-modal';
import { deleteCampaignAction } from '../actions';

export function CampaignCardActions({ campaign }: { campaign: Campaign }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="mt-3 flex items-center gap-2 border-t border-[var(--color-border)] pt-3">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-primary-soft)]"
      >
        Edit
      </button>
      <DeleteConfirm
        id={campaign.id}
        action={deleteCampaignAction}
        successMessage="Campaign deleted"
      />
      {editing && <CampaignFormModal campaign={campaign} onClose={() => setEditing(false)} />}
    </div>
  );
}
