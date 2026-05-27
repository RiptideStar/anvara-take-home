import type { Metadata } from 'next';
import { getAdSlots } from '@/lib/api';
import { Pagination } from '@/app/components/pagination';
import { AdSlotGrid } from './components/ad-slot-grid';
import { MarketplaceControls } from './components/marketplace-controls';

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse available sponsorship ad slots from premium publishers on Anvara.',
};

const PAGE_SIZE = 9;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = first(params.q).toLowerCase().trim();
  const type = first(params.type);
  const available = first(params.available);
  const page = Math.max(1, parseInt(first(params.page), 10) || 1);

  const all = await getAdSlots();

  const filtered = all.filter((slot) => {
    if (type && slot.type !== type) return false;
    if (available === 'true' && !slot.isAvailable) return false;
    if (q) {
      const haystack =
        `${slot.name} ${slot.description ?? ''} ${slot.publisher?.name ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const slots = filtered.slice(start, start + PAGE_SIZE);

  function makeHref(p: number): string {
    const sp = new URLSearchParams();
    if (q) sp.set('q', first(params.q));
    if (type) sp.set('type', type);
    if (available) sp.set('available', available);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `/marketplace?${qs}` : '/marketplace';
  }

  return (
    <div className="space-y-8">
      <header className="border-b border-[var(--color-border)] pb-6">
        <p className="eyebrow mb-3">Browse inventory</p>
        <h1 className="text-3xl sm:text-4xl">Marketplace</h1>
        <p className="mt-2 max-w-xl text-[var(--color-muted)]">
          Discover ad slots from premium publishers — filter by format and availability.
        </p>
      </header>

      <MarketplaceControls />

      {total === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-border)] p-12 text-center">
          <p className="text-lg">No slots match your search.</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Try clearing filters or searching for something else.
          </p>
        </div>
      ) : (
        <>
          <p className="eyebrow">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, total)} of {total}
          </p>
          <div className="rise">
            <AdSlotGrid slots={slots} />
          </div>
          <Pagination page={current} totalPages={totalPages} makeHref={makeHref} />
        </>
      )}
    </div>
  );
}
