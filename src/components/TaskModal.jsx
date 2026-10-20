import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bot, Bug, Calendar, CalendarX, Copy, Sparkles, Trash2, Wand2, X } from 'lucide-react';
import {
  CONTEXT_TOOLS,
  STAGES,
  TEAM,
  STATUS_IDS,
  TYPE_IDS,
  estimateTokenCount,
  formatTACOPrompt,
  getTypeLabel,
  parseISODate,
  shortId,
} from '../data/taskModel.js';

/**
 * TaskModal — Add / Edit / Delete task modal (M5 `crud-modal`).
 *
 * Design principles (DESIGN.md §4):
 * - Centered, max-w-lg, deep obsidian background with `backdrop-blur-md` overlay at 60% opacity.
 * - Primary action button: #22D3EE fill, dark #0B0F19 text, rounded-lg.
 * - Delete confirmation microcopy (DESIGN.md §5): "Delete this task permanently? This cannot be undone."
 *
 * WCAG 2.2 accessibility:
 * - role="dialog", aria-modal="true", aria-labelledby="modal-title"
 * - Escape key closes the modal
 * - Focus trapped within the modal while open
 * - Focus restored to the previous activeElement on close
 * - Body scroll locked while open
 * - Explicit <label> with htmlFor on all form inputs
 * - Title validation with aria-invalid and error message
 *
 * @param {{
 *   isOpen: boolean,
 *   mode: 'create' | 'edit',
 *   initialTask?: import('../data/taskModel.js').Task | null,
 *   initialStatus?: import('../data/taskModel.js').TaskStatus,
 *   onClose: () => void,
 *   onSave: (taskData: Partial<import('../data/taskModel.js').Task>) => void,
 *   onDelete?: (taskId: string) => void,
 * }} props
 */
export default function TaskModal({
  isOpen,
  mode = 'create',
  initialTask = null,
  initialStatus = 'todo',
  onClose,
  onSave,
  onDelete,
  onCopyPrompt,
}) {
  const isEdit = mode === 'edit' && !!initialTask;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('feature');
  const [status, setStatus] = useState('todo');
  const [assignee, setAssignee] = useState(TEAM[0]);
  const [dueDate, setDueDate] = useState('');
  const [context, setContext] = useState('');
  const [contextTool, setContextTool] = useState('Claude');
  const [titleError, setTitleError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const dialogRef = useRef(null);
  const titleInputRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  // Sync state when modal opens or initial values change
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement;
      setShowDeleteConfirm(false);
      setTitleError('');

      if (isEdit && initialTask) {
        setTitle(initialTask.title || '');
        setDescription(initialTask.description || '');
        setType(initialTask.type || 'feature');
        setStatus(initialTask.status || 'todo');
        setAssignee(initialTask.assignee || TEAM[0]);
        setDueDate(initialTask.dueDate || '');
        setContext(initialTask.context || '');
        setContextTool(initialTask.contextTool || 'Claude');
      } else {
        setTitle('');
        setDescription('');
        setType('feature');
        setStatus(initialStatus || 'todo');
        setAssignee(TEAM[0]);
        setDueDate('');
        setContext('');
        setContextTool('Claude');
      }

      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus first input
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen, isEdit, initialTask, initialStatus]);

  // Keyboard navigation & focus trap (WCAG 2.1.2)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!dialogRef.current) return;
        const focusable = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Task title is required.');
      titleInputRef.current?.focus();
      return;
    }

    const trimmedContext = context.trim();
    let contextUpdatedAt = initialTask?.contextUpdatedAt || null;
    if (trimmedContext && (!initialTask || trimmedContext !== (initialTask.context || '').trim())) {
      contextUpdatedAt = new Date().toISOString();
    } else if (!trimmedContext) {
      contextUpdatedAt = null;
    }

    const payload = {
      title: trimmedTitle,
      description: description.trim(),
      type: TYPE_IDS.includes(type) ? type : 'feature',
      status: STATUS_IDS.includes(status) ? status : 'todo',
      assignee: TEAM.includes(assignee) ? assignee : TEAM[0],
      dueDate: parseISODate(dueDate) ? dueDate : null,
      context: trimmedContext,
      contextTool: trimmedContext ? (CONTEXT_TOOLS.includes(contextTool) ? contextTool : 'Claude') : null,
      contextUpdatedAt,
    };

    if (isEdit && initialTask) {
      payload.id = initialTask.id;
    }

    onSave(payload);
    onClose();
  }

  function handleConfirmDelete() {
    if (isEdit && initialTask && onDelete) {
      onDelete(initialTask.id);
      onClose();
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-page/60 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-lg my-8 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl relative text-content-primary motion-safe:transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-primary shadow-dot-primary" />
              <h3 id="modal-title" className="font-heading text-lg font-bold tracking-tight text-content-primary">
                {isEdit ? 'Edit Task' : 'New Task'}
              </h3>
              {isEdit && (
                <span className="font-mono text-xs text-content-muted border border-surface-border rounded px-1.5 py-0.5">
                  {shortId(initialTask.id)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-content-muted">
              {isEdit ? 'Update details, stage, or owner.' : 'Create a vibecoding task for the board.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-content-muted hover:text-content-primary hover:bg-surface-page transition-colors"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {/* Delete Confirmation Banner (DESIGN.md §5) */}
        {showDeleteConfirm ? (
          <div className="mt-6 rounded-xl border border-type-bug/40 bg-type-bug/10 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle aria-hidden="true" className="h-5 w-5 shrink-0 text-type-bug mt-0.5" />
              <div>
                <h4 className="font-heading text-sm font-semibold text-content-primary">
                  Delete this task permanently?
                </h4>
                <p className="text-xs text-content-muted mt-0.5">
                  This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-surface-border px-3 py-1.5 text-xs font-medium text-content-primary hover:bg-surface-card transition-colors"
              >
                Keep Task
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-type-bug hover:bg-rose-500 px-3 py-1.5 text-xs font-semibold text-surface-page transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        ) : (
          /* Main Form */
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Title field */}
            <div>
              <label htmlFor="task-title" className="block text-xs font-mono font-medium text-content-primary mb-1">
                Title <span className="text-brand-primary" aria-hidden="true">*</span>
              </label>
              <input
                ref={titleInputRef}
                id="task-title"
                name="title"
                type="text"
                required
                aria-required="true"
                aria-invalid={!!titleError}
                aria-describedby={titleError ? 'task-title-error' : undefined}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                placeholder="e.g. Build task modal"
                className={`w-full rounded-lg border bg-surface-page px-3 py-2 text-sm text-content-primary placeholder:text-content-muted/50 focus:outline-none transition-colors ${
                  titleError ? 'border-type-bug focus:border-type-bug' : 'border-surface-border focus:border-brand-primary'
                }`}
              />
              {titleError && (
                <p id="task-title-error" className="mt-1 text-xs text-type-bug font-mono">
                  {titleError}
                </p>
              )}
            </div>

            {/* Description field */}
            <div>
              <label htmlFor="task-description" className="block text-xs font-mono font-medium text-content-primary mb-1">
                Description
              </label>
              <textarea
                id="task-description"
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary or prompt details..."
                className="w-full rounded-lg border border-surface-border bg-surface-page px-3 py-2 text-sm text-content-primary placeholder:text-content-muted/50 focus:border-brand-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Row 1: Type & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type */}
              <fieldset>
                <legend className="text-xs font-mono font-medium text-content-primary mb-1">
                  Type
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('feature')}
                    aria-pressed={type === 'feature'}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium font-mono transition-colors ${
                      type === 'feature'
                        ? 'border-type-feature bg-type-feature/10 text-type-feature'
                        : 'border-surface-border bg-surface-page text-content-muted hover:text-content-primary'
                    }`}
                  >
                    <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>Feature</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('bug')}
                    aria-pressed={type === 'bug'}
                    className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium font-mono transition-colors ${
                      type === 'bug'
                        ? 'border-type-bug bg-type-bug/10 text-type-bug'
                        : 'border-surface-border bg-surface-page text-content-muted hover:text-content-primary'
                    }`}
                  >
                    <Bug aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>Bug</span>
                  </button>
                </div>
              </fieldset>

              {/* Status */}
              <div>
                <label htmlFor="task-status" className="block text-xs font-mono font-medium text-content-primary mb-1">
                  Stage
                </label>
                <select
                  id="task-status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-surface-border bg-surface-page px-3 py-2 text-sm text-content-primary focus:border-brand-primary focus:outline-none transition-colors"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Assignee & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assignee */}
              <div>
                <label htmlFor="task-assignee" className="block text-xs font-mono font-medium text-content-primary mb-1">
                  Assignee
                </label>
                <select
                  id="task-assignee"
                  name="assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full rounded-lg border border-surface-border bg-surface-page px-3 py-2 text-sm text-content-primary focus:border-brand-primary focus:outline-none transition-colors"
                >
                  {TEAM.map((member) => (
                    <option key={member} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="task-due-date" className="block text-xs font-mono font-medium text-content-primary">
                    Due Date
                  </label>
                  {dueDate && (
                    <button
                      type="button"
                      onClick={() => setDueDate('')}
                      className="text-[11px] font-mono text-content-muted hover:text-brand-primary inline-flex items-center gap-1"
                    >
                      <CalendarX aria-hidden="true" className="h-3 w-3" />
                      Clear
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="task-due-date"
                    name="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-lg border border-surface-border bg-surface-page px-3 py-2 text-sm text-content-primary focus:border-brand-primary focus:outline-none transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: AI Prompt Context (M9 task-context) */}
            {/* Row 3: AI Prompt Context (M9 task-context + M12 TACO Enhancer & Token Meter) */}
            <div className="rounded-xl border border-surface-border bg-surface-page/50 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Bot aria-hidden="true" className="h-4 w-4 text-brand-primary" />
                  <label htmlFor="task-context" className="block text-xs font-mono font-medium text-content-primary">
                    AI Prompt Context / Briefing
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {/* TACO Auto-Framer (M12 Secret Sauce) */}
                  <button
                    type="button"
                    onClick={() => {
                      const enhanced = formatTACOPrompt(title, description, context, contextTool);
                      setContext(enhanced);
                    }}
                    title="Auto-format into Task-Actor-Context-Output structure"
                    className="inline-flex items-center gap-1 rounded border border-brand-accent/40 bg-brand-accent/10 px-2 py-0.5 text-[11px] font-mono text-brand-accent hover:bg-brand-accent/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <Wand2 aria-hidden="true" className="h-3 w-3" />
                    <span>Enhance (TACO)</span>
                  </button>

                  {/* Target Tool Selector */}
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="task-context-tool" className="text-[11px] font-mono text-content-muted">
                      Tool:
                    </label>
                    <select
                      id="task-context-tool"
                      name="contextTool"
                      value={contextTool}
                      onChange={(e) => setContextTool(e.target.value)}
                      className="rounded-md border border-surface-border bg-surface-card px-2 py-0.5 text-xs font-mono text-brand-primary focus:border-brand-primary focus:outline-none"
                    >
                      {CONTEXT_TOOLS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <textarea
                id="task-context"
                name="context"
                rows={4}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste prompt history, technical instructions, constraints, or bug trace for Claude / ChatGPT / Cursor..."
                className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 font-mono text-xs text-content-primary placeholder:text-content-muted/50 focus:border-brand-primary focus:outline-none transition-colors"
              />

              {/* Token Budget Meter (Option 3 / M12 Secret Sauce) */}
              {(() => {
                const tokens = estimateTokenCount(context);
                const budget = 3000;
                const percentage = Math.min(100, Math.round((tokens / budget) * 100));
                const isCaution = tokens >= 1000 && tokens <= 3000;
                const isDegraded = tokens > 3000;

                return (
                  <div className="space-y-1 pt-1 border-t border-surface-border/40">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-content-muted">Context Budget:</span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <span
                          className={
                            isDegraded
                              ? 'text-accent-red font-semibold'
                              : isCaution
                              ? 'text-accent-amber font-semibold'
                              : 'text-type-feature'
                          }
                        >
                          ~{tokens.toLocaleString()} tokens
                        </span>
                        <span className="text-content-muted">/ 3k target</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] ${
                            isDegraded
                              ? 'border border-accent-red/30 bg-accent-red/10 text-accent-red'
                              : isCaution
                              ? 'border border-accent-amber/30 bg-accent-amber/10 text-accent-amber'
                              : 'border border-type-feature/30 bg-type-feature/10 text-type-feature'
                          }`}
                        >
                          {isDegraded ? 'Risk: Degradation' : isCaution ? 'Caution' : 'Optimal'}
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-card">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDegraded
                            ? 'bg-accent-red'
                            : isCaution
                            ? 'bg-accent-amber'
                            : 'bg-type-feature'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between text-[11px] font-mono text-content-muted pt-1">
                <span>
                  {initialTask?.contextUpdatedAt
                    ? `Briefing updated: ${new Date(initialTask.contextUpdatedAt).toLocaleDateString()}`
                    : 'Paste-ready briefing for pair programming'}
                </span>
                {onCopyPrompt && (
                  <button
                    type="button"
                    onClick={() =>
                      onCopyPrompt({
                        id: initialTask?.id || 'draft',
                        title: title.trim() || 'Untitled Task',
                        description: description.trim(),
                        type,
                        status,
                        assignee,
                        dueDate: parseISODate(dueDate) ? dueDate : null,
                        context: context.trim(),
                        contextTool,
                        contextUpdatedAt: initialTask?.contextUpdatedAt || null,
                      })
                    }
                    className="inline-flex items-center gap-1 text-brand-primary hover:text-[#67e8f9] transition-colors"
                  >
                    <Copy aria-hidden="true" className="h-3 w-3" />
                    <span>Copy Prompt</span>
                  </button>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-surface-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isEdit && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-type-bug/30 px-3 py-2 text-xs font-medium text-type-bug hover:bg-type-bug/10 transition-colors"
                  >
                    <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>Delete Task</span>
                  </button>
                )}
                {onCopyPrompt && (
                  <button
                    type="button"
                    onClick={() =>
                      onCopyPrompt({
                        id: initialTask?.id || 'draft',
                        title: title.trim() || 'Untitled Task',
                        description: description.trim(),
                        type,
                        status,
                        assignee,
                        dueDate: parseISODate(dueDate) ? dueDate : null,
                        context: context.trim(),
                        contextTool,
                        contextUpdatedAt: initialTask?.contextUpdatedAt || null,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-primary/40 bg-brand-primary/10 px-3 py-2 text-xs font-mono font-medium text-brand-primary hover:bg-brand-primary/20 transition-colors"
                  >
                    <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>Copy as Prompt Context</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-content-muted hover:text-content-primary hover:bg-surface-page transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-surface-page hover:bg-[#67e8f9] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  {isEdit ? 'Save Changes' : '+ New Task'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
