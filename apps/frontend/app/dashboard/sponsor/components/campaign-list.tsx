import type { Campaign } from '@/lib/types';
import { CampaignCard } from './campaign-card';
import { CreateCampaignButton } from './create-campaign-button';

interface CampaignListProps {
  campaigns: Campaign[];
}

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rise flex flex-col items-center rounded-lg border border-dashed border-[var(--color-border)] px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="text-xl">No campaigns yet</h3>
        <p className="mb-6 mt-1 max-w-sm text-sm text-[var(--color-muted)]">
          Launch your first campaign to start reaching audiences through our publishers.
        </p>
        <CreateCampaignButton />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
