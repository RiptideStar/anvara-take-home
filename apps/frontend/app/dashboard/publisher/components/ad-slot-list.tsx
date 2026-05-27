import type { AdSlot } from '@/lib/types';
import { AdSlotCard } from './ad-slot-card';
import { CreateAdSlotButton } from './create-ad-slot-button';

interface AdSlotListProps {
  adSlots: AdSlot[];
}

export function AdSlotList({ adSlots }: AdSlotListProps) {
  if (adSlots.length === 0) {
    return (
      <div className="rise flex flex-col items-center rounded-lg border border-dashed border-[var(--color-border)] px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="text-xl">No ad slots yet</h3>
        <p className="mb-6 mt-1 max-w-sm text-sm text-[var(--color-muted)]">
          List your first ad slot to start earning from brands looking for your audience.
        </p>
        <CreateAdSlotButton />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {adSlots.map((slot) => (
        <AdSlotCard key={slot.id} adSlot={slot} />
      ))}
    </div>
  );
}
