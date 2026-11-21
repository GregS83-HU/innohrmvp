// Sober UI building blocks (pilot: dashboard home, subscription page, demo
// notice). Class-string helpers rather than wrapper components, so they
// work on <button>, <a> and next/link alike.
//
// The rules they encode:
// - One accent color: brand indigo, only for the primary action, links,
//   active/selected states and focus rings.
// - Slate grays for structure: canvas, cards, borders and secondary text.
// - Color otherwise only when it means something: emerald = success,
//   amber = warning/pending, red = error. Never decorative.
// - Flat surfaces: no gradients, thin borders, at most a light shadow, no
//   grow-on-hover.

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = ''): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${extra}`.trim();
}

/** Page background for in-app screens. */
export const pageClass = 'min-h-screen bg-slate-50';

/** Standard surface: white, thin border, rounded, faint shadow. */
export const cardClass = 'bg-white border border-slate-200 rounded-xl shadow-sm';

/** Small uppercase label above a group of content. */
export const eyebrowClass = 'text-xs font-medium uppercase tracking-wide text-slate-500';

/** Square tinted holder for a single-color icon. */
export const iconTileClass = 'w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0';
