// Small colored dot for traffic-light statuses (performance pulses, red
// flags). Replaces the 🟢 / 🟡 / 🔴 / ⚪ emoji: same meaning, rendered
// consistently on every platform and in the app's own status colors.

type Status = 'green' | 'yellow' | 'red' | string | null | undefined;

const COLORS: Record<string, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
};

export default function StatusDot({ status, size = 'md', label }: { status: Status; size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const color = (status && COLORS[status]) || 'bg-slate-300';
  const dim = size === 'lg' ? 'w-3.5 h-3.5' : size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  return (
    <span
      className={`inline-block flex-shrink-0 rounded-full ${dim} ${color}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
