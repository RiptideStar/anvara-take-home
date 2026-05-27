'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { FormState } from '@/lib/types';

const initialState: FormState = {};

function ConfirmSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-[--color-error] px-2 py-1 text-xs text-white hover:opacity-90 disabled:opacity-60"
    >
      {pending ? 'Deleting…' : 'Yes'}
    </button>
  );
}

interface DeleteConfirmProps {
  id: string;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
}

/**
 * Inline two-step delete. The "Delete" button swaps to "Delete? Yes / No".
 * On success the parent list is revalidated and this row unmounts.
 */
export function DeleteConfirm({ id, action }: DeleteConfirmProps) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState(action, initialState);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded border border-[--color-border] px-3 py-1 text-xs text-[--color-muted] hover:bg-gray-100"
      >
        Delete
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-xs text-[--color-muted]">Delete?</span>
      <ConfirmSubmit />
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded border border-[--color-border] px-2 py-1 text-xs hover:bg-gray-100"
      >
        No
      </button>
      {state.error && <span className="text-xs text-[--color-error]">{state.error}</span>}
    </form>
  );
}
