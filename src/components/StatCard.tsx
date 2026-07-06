import { cardClass } from '../lib/ui';

type Tone = 'neutral' | 'good' | 'critical';

const toneClass: Record<Tone, string> = {
  neutral: 'text-neutral-900 dark:text-neutral-100',
  good: 'text-[#0ca30c]',
  critical: 'text-[#d03b3b]',
};

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
}

export function StatCard({ label, value, sub, tone = 'neutral' }: StatCardProps) {
  return (
    <div className={cardClass}>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass[tone]}`}>
        {value}
      </p>
      {sub && (
        <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">{sub}</p>
      )}
    </div>
  );
}
