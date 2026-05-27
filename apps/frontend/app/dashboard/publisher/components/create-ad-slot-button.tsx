'use client';

import { useState } from 'react';
import { AdSlotFormModal } from './ad-slot-form-modal';

export function CreateAdSlotButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-primary-hover)]"
      >
        + New Ad Slot
      </button>
      {open && <AdSlotFormModal onClose={() => setOpen(false)} />}
    </>
  );
}
