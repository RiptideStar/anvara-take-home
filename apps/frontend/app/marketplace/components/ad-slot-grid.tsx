import Link from 'next/link';
import type { AdSlot } from '@/lib/types';

export function AdSlotGrid({ slots }: { slots: AdSlot[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {slots.map((slot) => (
        <Link
          key={slot.id}
          href={`/marketplace/${slot.id}`}
          className="group flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors duration-200 hover:border-[var(--color-border-strong)]"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-lg leading-snug transition-colors group-hover:text-[var(--color-primary)]">
              {slot.name}
            </h3>
            <span className="eyebrow shrink-0 rounded-full border border-[var(--color-border)] px-2 py-1">
              {slot.type}
            </span>
          </div>

          {slot.publisher && (
            <p className="mb-2 text-sm text-[var(--color-muted)]">by {slot.publisher.name}</p>
          )}

          {slot.description && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)]">
              {slot.description}
            </p>
          )}

          <div className="mt-auto flex items-end justify-between border-t border-[var(--color-border)] pt-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: slot.isAvailable
                    ? 'var(--color-success)'
                    : 'var(--color-muted)',
                }}
              />
              {slot.isAvailable ? 'Available' : 'Booked'}
            </span>
            <span className="font-display tnum text-lg text-[var(--color-foreground)]">
              ${Number(slot.basePrice).toLocaleString()}
              <span className="text-sm text-[var(--color-muted)]">/mo</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
