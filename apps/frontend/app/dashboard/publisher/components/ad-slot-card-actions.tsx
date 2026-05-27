'use client';

import { useState } from 'react';
import { DeleteConfirm } from '@/app/components/delete-confirm';
import type { AdSlot } from '@/lib/types';
import { AdSlotFormModal } from './ad-slot-form-modal';
import { deleteAdSlotAction } from '../actions';

export function AdSlotCardActions({
  adSlot,
  onDeletingChange,
}: {
  adSlot: AdSlot;
  onDeletingChange?: (deleting: boolean) => void;
}) {
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
        id={adSlot.id}
        action={deleteAdSlotAction}
        successMessage="Ad slot deleted"
        onDeletingChange={onDeletingChange}
      />
      {editing && <AdSlotFormModal adSlot={adSlot} onClose={() => setEditing(false)} />}
    </div>
  );
}
