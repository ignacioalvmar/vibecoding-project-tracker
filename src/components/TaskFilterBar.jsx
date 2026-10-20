import { TASK_TYPES } from '../data/taskModel.js';

/**
 * Card type filter bar — a segmented control that narrows the board down to
 * only Feature cards, only Bug cards, or everything.
 *
 * Purely presentational: owns no state. `value` is `'all' | TaskType`, and
 * `onChange` receives the newly selected id. The filtered view is computed
 * by the parent (App), so stored data is never mutated — this only changes
 * what gets rendered.
 *
 * Colored dots echo the M6 tag-style tokens (`type-feature` / `type-bug`)
 * but are decorative: each option also has a text label, so colour is never
 * the only indicator (WCAG 1.4.1).
 */

const FILTERS = [
  { id: 'all', label: 'All' },
  ...TASK_TYPES.map((t) => ({ id: t.id, label: t.label })),
];

/** M6 color tokens as small status dots next to the type labels. */
const DOT_CLASS = {
  feature: 'bg-type-feature',
  bug: 'bg-type-bug',
};

/**
 * @param {{
 *   value: string,                      // 'all' | 'feature' | 'bug'
 *   onChange: (id: string) => void,
 * }} props
 */
export default function TaskFilterBar({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Filter tasks by type"
      className="inline-flex items-center gap-1 rounded-xl border border-surface-border bg-surface-card p-1"
    >
      {FILTERS.map((filter) => {
        const active = value === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary ${
              active
                ? 'bg-brand-primary font-medium text-surface-page'
                : 'text-content-muted hover:bg-surface-border/40 hover:text-content-primary'
            }`}
          >
            {DOT_CLASS[filter.id] && (
              <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[filter.id]}`} />
            )}
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
