'use client';

// React 19 renamed useFormState -> useActionState (same hook, from 'react').
import { useActionState, useEffect } from 'react';
import { Modal } from '@/app/components/modal';
import { SubmitButton } from '@/app/components/submit-button';
import { useToast } from '@/app/components/toast';
import type { AdSlot, FormState } from '@/lib/types';
import { createAdSlotAction, updateAdSlotAction } from '../actions';

const initialState: FormState = {};

const TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'] as const;

interface AdSlotFormModalProps {
  onClose: () => void;
  adSlot?: AdSlot; // present => edit mode
}

export function AdSlotFormModal({ onClose, adSlot }: AdSlotFormModalProps) {
  const isEdit = Boolean(adSlot);
  const { toast } = useToast();
  const [state, formAction] = useActionState(
    isEdit ? updateAdSlotAction : createAdSlotAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast(isEdit ? 'Ad slot updated' : 'Ad slot created');
      onClose();
    }
  }, [state.success, isEdit, toast, onClose]);

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit ad slot' : 'New ad slot'}>
      <form action={formAction} className="space-y-4">
        {isEdit && <input type="hidden" name="id" value={adSlot!.id} />}

        {state.error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-[var(--color-error)]">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            defaultValue={adSlot?.name}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          />
          {state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{state.fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium">
            Description <span className="text-[var(--color-muted)]">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            defaultValue={adSlot?.description}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="type" className="mb-1 block text-sm font-medium">
              Type
            </label>
            <select
              id="type"
              name="type"
              defaultValue={adSlot?.type ?? 'DISPLAY'}
              className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {state.fieldErrors?.type && (
              <p className="mt-1 text-xs text-[var(--color-error)]">{state.fieldErrors.type}</p>
            )}
          </div>
          <div>
            <label htmlFor="basePrice" className="mb-1 block text-sm font-medium">
              Base price (USD)
            </label>
            <input
              id="basePrice"
              name="basePrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={adSlot ? Number(adSlot.basePrice) : ''}
              className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            />
            {state.fieldErrors?.basePrice && (
              <p className="mt-1 text-xs text-[var(--color-error)]">{state.fieldErrors.basePrice}</p>
            )}
          </div>
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isAvailable"
              defaultChecked={adSlot?.isAvailable}
              className="rounded border-[var(--color-border)]"
            />
            Available for booking
          </label>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-[var(--color-border)] px-4 py-2 text-sm transition-colors hover:bg-[var(--color-primary-soft)]"
          >
            Cancel
          </button>
          <SubmitButton idle={isEdit ? 'Save' : 'Create'} pending="Saving…" />
        </div>
      </form>
    </Modal>
  );
}
