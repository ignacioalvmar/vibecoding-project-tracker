import { useEffect } from 'react';
import { UserCheck, X } from 'lucide-react';

/**
 * Toast — lightweight notification (M7 `task-owner` / DESIGN.md §5 & §7).
 *
 * Microcopy for handoff: "Task handed off to {name}."
 * Animation: 200 ms fade transition (DESIGN.md §7 constraint).
 *
 * WCAG 2.2:
 * - role="status", aria-live="polite" for screen reader announcements.
 * - Dismissible via button.
 *
 * @param {{
 *   message: string | null,
 *   onClose: () => void,
 *   durationMs?: number,
 * }} props
 */
export default function Toast({ message, onClose, durationMs = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [message, onClose, durationMs]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-brand-primary/40 bg-surface-card px-4 py-3 text-sm text-content-primary shadow-glow-primary motion-safe:transition-opacity motion-safe:duration-200 animate-in fade-in"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
        <UserCheck aria-hidden="true" className="h-4 w-4" />
      </div>

      <p className="font-mono text-xs font-medium text-content-primary">{message}</p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="ml-2 rounded-md p-1 text-content-muted hover:bg-surface-page hover:text-content-primary transition-colors"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
