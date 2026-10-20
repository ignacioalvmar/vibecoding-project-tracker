import { useEffect, useRef, useState } from 'react';
import { AtSign, Mail, ShieldCheck, User, X } from 'lucide-react';

/**
 * User Registration & Profile Modal (M12 `secret-sauce`).
 * Captures:
 * - user name
 * - user email
 * - github account tag (e.g. `@LegionerLeonid99`, just tag no URLs as specified)
 *
 * @param {{
 *   isOpen: boolean,
 *   currentUser: { name: string, email: string, githubTag: string, initials?: string },
 *   onClose: () => void,
 *   onSave: (user: { name: string, email: string, githubTag: string, initials: string }) => void,
 * }} props
 */
export default function ProfileModal({ isOpen, currentUser, onClose, onSave }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [githubTag, setGithubTag] = useState('');
  const [error, setError] = useState('');

  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement;
      setName(currentUser?.name || '');
      setEmail(currentUser?.email || '');
      setGithubTag(currentUser?.githubTag || '@LegionerLeonid99');
      setError('');

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen, currentUser]);

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

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
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
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    let trimmedTag = githubTag.trim();

    if (!trimmedName) {
      setError('Name is required.');
      nameInputRef.current?.focus();
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!trimmedTag) {
      setError('GitHub account tag is required.');
      return;
    }

    // Ensure GitHub tag starts with @ and contains no URL
    if (!trimmedTag.startsWith('@')) {
      trimmedTag = `@${trimmedTag}`;
    }
    trimmedTag = trimmedTag.replace(/^https?:\/\/(github\.com\/)?/i, '@');

    const words = trimmedName.split(/\s+/).filter(Boolean);
    const initials = words.length >= 2
      ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
      : (trimmedName.slice(0, 2) || 'DO').toUpperCase();

    onSave({
      name: trimmedName,
      email: trimmedEmail,
      githubTag: trimmedTag,
      initials,
    });
    onClose();
  }

  const initialsPreview = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'DO';

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-page/70 backdrop-blur-md overflow-y-auto"
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
        aria-labelledby="profile-modal-title"
        className="w-full max-w-md my-8 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl relative text-content-primary motion-safe:transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-primary/40 bg-brand-primary/10 font-mono text-sm font-bold text-brand-primary shadow-glow-primary"
              aria-hidden="true"
            >
              {initialsPreview}
            </span>
            <div>
              <h3 id="profile-modal-title" className="font-heading text-lg font-bold tracking-tight text-content-primary">
                Operator Registration
              </h3>
              <p className="text-xs text-content-muted">
                VibeTracker developer profile and GitHub tag.
              </p>
            </div>
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

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-lg border border-accent-red/40 bg-accent-red/10 px-3 py-2 text-xs font-mono text-accent-red">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* User Name */}
          <div>
            <label htmlFor="reg-name" className="block text-xs font-mono font-medium text-content-primary mb-1">
              Full Name <span className="text-brand-primary">*</span>
            </label>
            <div className="relative">
              <User aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-content-muted" />
              <input
                id="reg-name"
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Daniil Osadcenco"
                className="w-full rounded-lg border border-surface-border bg-surface-page pl-9 pr-3 py-2 text-sm text-content-primary focus:border-brand-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* User Email */}
          <div>
            <label htmlFor="reg-email" className="block text-xs font-mono font-medium text-content-primary mb-1">
              Developer Email <span className="text-brand-primary">*</span>
            </label>
            <div className="relative">
              <Mail aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-content-muted" />
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="daniil@vibecoding.dev"
                className="w-full rounded-lg border border-surface-border bg-surface-page pl-9 pr-3 py-2 text-sm text-content-primary focus:border-brand-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* GitHub Account Tag (Tag only, no URLs) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="reg-github" className="block text-xs font-mono font-medium text-content-primary">
                GitHub Account Tag <span className="text-brand-primary">*</span>
              </label>
              <span className="text-[11px] font-mono text-content-muted">Tag only, e.g. @username</span>
            </div>
            <div className="relative">
              <AtSign aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-brand-primary" />
              <input
                id="reg-github"
                type="text"
                value={githubTag}
                onChange={(e) => setGithubTag(e.target.value)}
                placeholder="@LegionerLeonid99"
                className="w-full rounded-lg border border-surface-border bg-surface-page pl-9 pr-3 py-2 font-mono text-sm text-content-primary focus:border-brand-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="rounded-xl border border-surface-border/60 bg-surface-page/40 p-3 flex items-start gap-2.5">
            <ShieldCheck aria-hidden="true" className="h-4 w-4 text-type-feature shrink-0 mt-0.5" />
            <p className="text-[11px] text-content-muted leading-relaxed">
              Profile credentials persist locally in this browser. Your GitHub handle is rendered on assignee badges and AI prompt context briefings.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-content-muted hover:text-content-primary hover:bg-surface-page transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-surface-page hover:bg-[#67e8f9] transition-all hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-brand-primary shadow-glow-primary"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
