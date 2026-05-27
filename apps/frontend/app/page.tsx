import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The Sponsorship Marketplace',
  description:
    'Anvara connects brands with premium publishers — discover ad slots, launch campaigns, and book sponsorships with clarity.',
};

const SPONSOR_POINTS = [
  'Discover vetted publishers by audience and category',
  'Launch campaigns with budgets, dates, and targeting',
  'Track spend against budget in one place',
];

const PUBLISHER_POINTS = [
  'List your inventory with transparent pricing',
  'Set availability and manage every slot',
  'Reach brands actively looking for your audience',
];

const STATS = [
  { value: '120+', label: 'Publishers' },
  { value: '30', label: 'Categories' },
  { value: '$2M+', label: 'Booked' },
];

export default function Home() {
  return (
    <div className="rise">
      {/* Hero */}
      <section className="border-b border-[var(--color-border)] py-16 sm:py-24">
        <p className="eyebrow mb-6">The sponsorship marketplace</p>
        <h1 className="max-w-3xl text-balance text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
          Reach the right audience, through the publishers they already trust.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">
          Anvara is a curated marketplace where brands and publishers meet — browse premium ad
          inventory, launch campaigns, and book sponsorships with none of the back-and-forth.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/marketplace"
            className="rounded bg-[var(--color-primary)] px-5 py-2.5 text-sm text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Browse the marketplace
          </Link>
          <Link
            href="/login"
            className="rounded border border-[var(--color-border-strong)] px-5 py-2.5 text-sm transition-colors hover:bg-[var(--color-primary-soft)]"
          >
            Sign in
          </Link>
        </div>

        <dl className="mt-12 flex flex-wrap gap-x-12 gap-y-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <dt className="font-display tnum text-3xl text-[var(--color-foreground)]">{s.value}</dt>
              <dd className="eyebrow mt-1">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Two-sided value props */}
      <section className="grid gap-px overflow-hidden border-b border-[var(--color-border)] sm:grid-cols-2">
        <Audience
          eyebrow="For sponsors"
          heading="Put your budget where attention lives."
          points={SPONSOR_POINTS}
          href="/dashboard/sponsor"
          cta="Go to sponsor dashboard"
        />
        <Audience
          eyebrow="For publishers"
          heading="Turn your audience into recurring revenue."
          points={PUBLISHER_POINTS}
          href="/dashboard/publisher"
          cta="Go to publisher dashboard"
        />
      </section>

      {/* Closing band — the one high-contrast moment */}
      <section className="my-16 rounded-lg bg-[var(--color-primary)] px-8 py-14 text-center text-[var(--color-on-primary)]">
        <h2 className="mx-auto max-w-2xl text-3xl leading-tight sm:text-4xl">
          A marketplace built for the people on both sides of the deal.
        </h2>
        <Link
          href="/marketplace"
          className="mt-8 inline-block rounded bg-[var(--color-on-primary)] px-6 py-3 text-sm text-[var(--color-primary)] transition-opacity hover:opacity-90"
        >
          Explore ad slots
        </Link>
      </section>
    </div>
  );
}

function Audience({
  eyebrow,
  heading,
  points,
  href,
  cta,
}: {
  eyebrow: string;
  heading: string;
  points: string[];
  href: string;
  cta: string;
}) {
  return (
    <div className="bg-[var(--color-surface)] p-8 sm:p-10">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 className="mb-6 max-w-sm text-2xl leading-snug">{heading}</h2>
      <ul className="space-y-3">
        {points.map((p) => (
          <li key={p} className="flex gap-3 text-sm leading-relaxed text-[var(--color-muted)]">
            <span aria-hidden className="mt-1.5 h-1 w-4 shrink-0 bg-[var(--color-secondary)]" />
            {p}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="mt-8 inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)]"
      >
        {cta}
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
