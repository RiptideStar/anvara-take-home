import type { AdSlot } from '@/lib/types';
import { AdSlotCardActions } from './ad-slot-card-actions';

interface AdSlotCardProps {
  adSlot: AdSlot;
}

export function AdSlotCard({ adSlot }: AdSlotCardProps) {
  return (
    <div className="flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors duration-200 hover:border-[var(--color-border-strong)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg leading-snug">{adSlot.name}</h3>
        <span className="eyebrow shrink-0 rounded-full border border-[var(--color-border)] px-2 py-1">
          {adSlot.type}
        </span>
      </div>

      {adSlot.description && (
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)]">
          {adSlot.description}
        </p>
      )}

      <div className="mt-auto flex items-end justify-between border-t border-[var(--color-border)] pt-3">
        <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: adSlot.isAvailable ? 'var(--color-success)' : 'var(--color-muted)',
            }}
          />
          {adSlot.isAvailable ? 'Available' : 'Booked'}
        </span>
        <span className="font-display tnum text-lg text-[var(--color-foreground)]">
          ${Number(adSlot.basePrice).toLocaleString()}
          <span className="text-sm text-[var(--color-muted)]">/mo</span>
        </span>
      </div>

      <AdSlotCardActions adSlot={adSlot} />
    </div>
  );
}
