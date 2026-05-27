'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  idle: string;
  pending: string;
  className?: string;
}

/**
 * Submit button that reflects the enclosing form's pending state via
 * useFormStatus. Must be rendered inside a <form>.
 */
export function SubmitButton({ idle, pending, className }: SubmitButtonProps) {
  const { pending: isPending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={isPending}
      className={
        className ??
        'rounded bg-[var(--color-primary)] px-4 py-2 text-sm text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60'
      }
    >
      {isPending ? pending : idle}
    </button>
  );
}
