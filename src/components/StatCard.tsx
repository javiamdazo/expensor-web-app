import { cn } from '../lib/utils';

type Tone = 'neutral' | 'good' | 'critical';

const toneClass: Record<Tone, string> = {
  neutral: 'text-foreground',
  good: 'text-positive',
  critical: 'text-negative',
};

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
}

export function StatCard({ label, value, sub, tone = 'neutral' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-[18px]">
      <p className="text-[12.5px] font-semibold text-muted-foreground">{label}</p>
      <p className={cn('mt-2 font-mono text-[26px] font-bold tabular-nums', toneClass[tone])}>
        {value}
      </p>
      {sub && <p className="mt-1 font-mono text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
