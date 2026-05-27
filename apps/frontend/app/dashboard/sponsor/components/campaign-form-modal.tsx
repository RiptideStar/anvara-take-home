'use client';

// React 19 renamed useFormState -> useActionState (same hook, from 'react').
import { useActionState, useEffect } from 'react';
import { Modal } from '@/app/components/modal';
import { SubmitButton } from '@/app/components/submit-button';
import { useToast } from '@/app/components/toast';
import type { Campaign, FormState } from '@/lib/types';
import { createCampaignAction, updateCampaignAction } from '../actions';

const initialState: FormState = {};

const STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'] as const;

function toDateInput(value?: string): string {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

interface CampaignFormModalProps {
  onClose: () => void;
  campaign?: Campaign; // present => edit mode
}

export function CampaignFormModal({ onClose, campaign }: CampaignFormModalProps) {
  const isEdit = Boolean(campaign);
  const { toast } = useToast();
  const [state, formAction] = useActionState(
    isEdit ? updateCampaignAction : createCampaignAction,
    initialState,
  );

  // Close once the mutation succeeds; revalidatePath refreshes the list.
  useEffect(() => {
    if (state.success) {
      toast(isEdit ? 'Campaign updated' : 'Campaign created');
      onClose();
    }
  }, [state.success, isEdit, toast, onClose]);

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit campaign' : 'New campaign'}>
      <form action={formAction} className="space-y-4">
        {isEdit && <input type="hidden" name="id" value={campaign!.id} />}

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
            defaultValue={campaign?.name}
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
            defaultValue={campaign?.description}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="budget" className="mb-1 block text-sm font-medium">
            Budget (USD)
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            min="0"
            step="0.01"
            defaultValue={campaign ? Number(campaign.budget) : ''}
            className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
          />
          {state.fieldErrors?.budget && (
            <p className="mt-1 text-xs text-[var(--color-error)]">{state.fieldErrors.budget}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className="mb-1 block text-sm font-medium">
              Start date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={toDateInput(campaign?.startDate)}
              className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            />
            {state.fieldErrors?.startDate && (
              <p className="mt-1 text-xs text-[var(--color-error)]">{state.fieldErrors.startDate}</p>
            )}
          </div>
          <div>
            <label htmlFor="endDate" className="mb-1 block text-sm font-medium">
              End date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={toDateInput(campaign?.endDate)}
              className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            />
            {state.fieldErrors?.endDate && (
              <p className="mt-1 text-xs text-[var(--color-error)]">{state.fieldErrors.endDate}</p>
            )}
          </div>
        </div>

        {isEdit && (
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={campaign?.status}
              className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
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
