'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { FormState } from '@/lib/types';
import { useToast } from './toast';

const initialState: FormState = {};

function ConfirmSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-[var(--color-error)] px-2 py-1 text-xs text-white hover:opacity-90 disabled:opacity-60"
    >
      {pending ? 'Deleting…' : 'Yes'}
    </button>
  );
}

interface DeleteConfirmProps {
  id: string;
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  successMessage?: string;
  /** Notified when deletion starts/aborts so the parent can animate the row out. */
  onDeletingChange?: (deleting: boolean) => void;
}

/**
 * Inline two-step delete. The "Delete" button swaps to "Delete? Yes / No".
 * On success the parent list is revalidated and this row unmounts.
 */
export function DeleteConfirm({
  id,
  action,
  successMessage = 'Deleted',
  onDeletingChange,
}: DeleteConfirmProps) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState(action, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.success) {
      toast(successMessage);
    } else if (state.error) {
      toast(state.error, 'error');
      onDeletingChange?.(false); // delete failed — cancel the fade-out
    }
  }, [state.success, state.error, successMessage, toast, onDeletingChange]);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded border border-[var(--color-border)] px-3 py-1 text-xs text-[var(--color-muted)] transition-colors hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-foreground)]"
      >
        Delete
      </button>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={() => onDeletingChange?.(true)}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <span className="text-xs text-[var(--color-muted)]">Delete?</span>
      <ConfirmSubmit />
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded border border-[var(--color-border)] px-2 py-1 text-xs transition-colors hover:bg-[var(--color-primary-soft)]"
      >
        No
      </button>
      {state.error && <span className="text-xs text-[var(--color-error)]">{state.error}</span>}
    </form>
  );
}
