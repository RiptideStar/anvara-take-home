import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserRole } from '@/lib/auth-helpers';
import { getAdSlots } from '@/lib/api';
import { StatCards } from '@/app/components/stat-cards';
import { AdSlotList } from './components/ad-slot-list';
import { CreateAdSlotButton } from './components/create-ad-slot-button';

function money(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${Math.round(n)}`;
}

export default async function PublisherDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Verify user has 'publisher' role
  const roleData = await getUserRole(session.user.id);
  if (roleData.role !== 'publisher') {
    redirect('/');
  }

  // Fetch ad slots on the server. Any failure propagates to error.tsx.
  const adSlots = await getAdSlots(roleData.publisherId);

  const availableCount = adSlots.filter((s) => s.isAvailable).length;
  const avgPrice =
    adSlots.length > 0
      ? adSlots.reduce((sum, s) => sum + Number(s.basePrice), 0) / adSlots.length
      : 0;
  const stats = [
    { label: 'Ad slots', value: String(adSlots.length) },
    { label: 'Available', value: String(availableCount) },
    { label: 'Avg price', value: `${money(avgPrice)}/mo` },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <p className="eyebrow mb-3">Publisher dashboard</p>
          <h1 className="text-3xl sm:text-4xl">My Ad Slots</h1>
        </div>
        <CreateAdSlotButton />
      </header>

      {adSlots.length > 0 && <StatCards stats={stats} />}

      <AdSlotList adSlots={adSlots} />
    </div>
  );
}
