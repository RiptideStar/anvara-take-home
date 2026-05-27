'use client';

import { useState } from 'react';
import { CampaignFormModal } from './campaign-form-modal';

export function CreateCampaignButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded bg-[--color-primary] px-4 py-2 text-sm text-white hover:bg-[--color-primary-hover]"
      >
        + New Campaign
      </button>
      {open && <CampaignFormModal onClose={() => setOpen(false)} />}
    </>
  );
}
