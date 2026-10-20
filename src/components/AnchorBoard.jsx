import { useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  MonitorPlay,
  Pencil,
  Presentation,
  Trash2,
  X,
} from 'lucide-react';

/**
 * Icons & style configuration for the 4 pinned deliverables (PRD §5).
 */
const ANCHOR_CONFIG = {
  presentation: {
    Icon: Presentation,
    description: 'Slide deck or pitch presentation link',
    placeholder: 'https://slides.new/... or Pitch link',
    accent: 'text-brand-primary',
  },
  demo: {
    Icon: MonitorPlay,
    description: 'Interactive demo or Loom video recording',
    placeholder: 'https://demo.vercel.app or video link',
    accent: 'text-brand-accent',
  },
  report: {
    Icon: FileText,
    description: 'Final project report / hackathon write-up',
    placeholder: 'https://docs.google.com/... or Notion link',
    accent: 'text-accent-amber',
  },
  documentation: {
    Icon: BookOpen,
    description: 'Repository README or architecture guide',
    placeholder: 'https://github.com/.../blob/main/README.md',
    accent: 'text-type-feature',
  },
};

/**
 * Anchor Card for a single deliverable.
 *
 * @param {{
 *   anchor: { id: string, label: string, url: string | null },
 *   onSaveUrl: (id: string, url: string | null) => void,
 * }} props
 */
function AnchorCard({ anchor, onSaveUrl }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState(anchor.url || '');
  const [inputError, setInputError] = useState('');

  const cfg = ANCHOR_CONFIG[anchor.id] || ANCHOR_CONFIG.presentation;
  const DeliverableIcon = cfg.Icon;
  const hasUrl = Boolean(anchor.url && anchor.url.trim());

  const handleStartEdit = () => {
    setInputUrl(anchor.url || '');
    setInputError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputError('');
  };

  const handleSave = (e) => {
    e?.preventDefault();
    const trimmed = inputUrl.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      setInputError('URL must start with http:// or https://');
      return;
    }
    onSaveUrl(anchor.id, trimmed || null);
    setIsEditing(false);
    setInputError('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSaveUrl(anchor.id, null);
    setInputUrl('');
  };

  return (
    <div className="relative flex flex-col justify-between rounded-xl border border-surface-border bg-surface-card p-4 hover:border-surface-border/80 motion-safe:transition-all">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-lg border border-surface-border bg-surface-page p-2 ${cfg.accent}`}
              aria-hidden="true"
            >
              <DeliverableIcon className="h-4 w-4" />
            </span>
            <div>
              <h4 className="font-heading text-sm font-semibold text-content-primary">
                {anchor.label}
              </h4>
              <p className="text-[11px] text-content-muted leading-tight mt-0.5">
                {cfg.description}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${
              hasUrl
                ? 'border border-type-feature/30 bg-type-feature/10 text-type-feature'
                : 'border border-surface-border bg-surface-page text-content-muted'
            }`}
          >
            {hasUrl ? (
              <>
                <CheckCircle2 aria-hidden="true" className="h-2.5 w-2.5" />
                <span>Ready</span>
              </>
            ) : (
              <>
                <Clock aria-hidden="true" className="h-2.5 w-2.5" />
                <span>Pending</span>
              </>
            )}
          </span>
        </div>

        {/* Link / Input Section */}
        <div className="mt-3">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-2">
              <label htmlFor={`anchor-input-${anchor.id}`} className="sr-only">
                {anchor.label} URL
              </label>
              <input
                id={`anchor-input-${anchor.id}`}
                type="url"
                autoFocus
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setInputError('');
                }}
                placeholder={cfg.placeholder}
                className="w-full rounded-lg border border-surface-border bg-surface-page px-2.5 py-1.5 font-mono text-xs text-content-primary placeholder:text-content-muted/50 focus:border-brand-primary focus:outline-none"
              />
              {inputError && (
                <p className="text-[11px] font-mono text-accent-red">{inputError}</p>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded px-2 py-1 text-xs text-content-muted hover:text-content-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-brand-primary px-2.5 py-1 text-xs font-semibold text-surface-page hover:bg-[#67e8f9] transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          ) : hasUrl ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-surface-border/60 bg-surface-page/60 px-2.5 py-1.5">
              <a
                href={anchor.url}
                target="_blank"
                rel="noopener noreferrer"
                title={anchor.url}
                className="flex min-w-0 items-center gap-1.5 font-mono text-xs text-brand-primary hover:underline"
              >
                <ExternalLink aria-hidden="true" className="h-3 w-3 shrink-0" />
                <span className="truncate">{anchor.url.replace(/^https?:\/\//i, '')}</span>
              </a>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleStartEdit}
                  title={`Edit ${anchor.label} link`}
                  aria-label={`Edit ${anchor.label} link`}
                  className="rounded p-1 text-content-muted hover:text-content-primary transition-colors"
                >
                  <Pencil aria-hidden="true" className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  title={`Clear ${anchor.label} link`}
                  aria-label={`Clear ${anchor.label} link`}
                  className="rounded p-1 text-content-muted hover:text-accent-red transition-colors"
                >
                  <X aria-hidden="true" className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartEdit}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-surface-border py-1.5 text-xs font-mono text-content-muted hover:border-brand-primary/60 hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary"
            >
              <span>+ Add link</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Deliverable Anchor Board (M11 `project-deliverables` / `anchors`).
 * Pins the four hackathon final deliverables above the Kanban board columns.
 *
 * @param {{
 *   anchors: Array<{ id: string, label: string, url: string | null }>,
 *   onSaveUrl: (id: string, url: string | null) => void,
 * }} props
 */
export default function AnchorBoard({ anchors, onSaveUrl }) {
  const readyCount = anchors.filter((a) => Boolean(a.url && a.url.trim())).length;

  return (
    <section aria-labelledby="anchors-heading" className="mb-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-brand-primary shadow-dot-primary"
            />
            <p className="font-mono text-xs uppercase tracking-widest text-brand-primary">
              Anchor Board
            </p>
          </div>
          <h3
            id="anchors-heading"
            className="mt-0.5 font-heading text-lg font-semibold tracking-tight text-content-primary"
          >
            Pinned Project Deliverables
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-content-muted">Readiness:</span>
          <span
            className={`rounded-lg border px-2.5 py-1 font-medium ${
              readyCount === 4
                ? 'border-type-feature/40 bg-type-feature/10 text-type-feature'
                : 'border-surface-border bg-surface-card text-content-primary'
            }`}
          >
            {readyCount} of 4 Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {anchors.map((anchor) => (
          <AnchorCard key={anchor.id} anchor={anchor} onSaveUrl={onSaveUrl} />
        ))}
      </div>
    </section>
  );
}
