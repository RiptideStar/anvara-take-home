'use client';

import { useState } from 'react';
import type { Campaign } from '@/lib/types';
import { StatusBadge } from '@/app/components/status-badge';
import { CampaignCardActions } from './campaign-card-actions';

interface CampaignCardProps {
  campaign: Campaign;
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [removing, setRemoving] = useState(false);
  const budget = Number(campaign.budget);
  const spent = Number(campaign.spent);
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <div
      className={`group flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors duration-200 hover:border-[var(--color-border-strong)] ${
        removing ? 'removing' : ''
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-lg leading-snug">{campaign.name}</h3>
        <StatusBadge status={campaign.status} />
      </div>

      {campaign.description && (
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)]">
          {campaign.description}
        </p>
      )}

      <div className="mb-4 mt-auto">
        <div className="flex items-baseline justify-between text-sm">
          <span className="eyebrow">Budget</span>
          <span className="tnum text-[var(--color-foreground)]">
            ${spent.toLocaleString()}{' '}
            <span className="text-[var(--color-muted)]">/ ${budget.toLocaleString()}</span>
          </span>
        </div>
        <div className="mt-2 h-px w-full bg-[var(--color-border)]">
          <div className="h-px bg-[var(--color-primary)]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="tnum text-xs text-[var(--color-muted)]">
        {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
      </div>

      <CampaignCardActions campaign={campaign} onDeletingChange={setRemoving} />
    </div>
  );
}
