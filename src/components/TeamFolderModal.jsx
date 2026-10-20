import { useEffect, useRef } from 'react';
import {
  AtSign,
  Briefcase,
  Bug,
  CheckCircle2,
  Clock,
  ExternalLink,
  FolderGit2,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { TEAM_MEMBERS } from '../data/taskModel.js';

/**
 * Team Folder Workspace Drawer / Modal (M12 `secret-sauce`).
 *
 * Displays team members, their GitHub handles, active workload, and sprint distribution.
 *
 * @param {{
 *   isOpen: boolean,
 *   tasks: import('../data/taskModel.js').Task[],
 *   anchors: Array<{ id: string, label: string, url: string | null }>,
 *   onClose: () => void,
 * }} props
 */
export default function TeamFolderModal({ isOpen, tasks, anchors, onClose }) {
  const dialogRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate teammate workloads
  const memberStats = TEAM_MEMBERS.map((m) => {
    const memberTasks = tasks.filter((t) => t.assignee === m.name);
    const completed = memberTasks.filter((t) => t.status === 'done').length;
    const open = memberTasks.length - completed;
    const bugs = memberTasks.filter((t) => t.type === 'bug').length;
    const features = memberTasks.filter((t) => t.type === 'feature').length;
    return {
      ...m,
      total: memberTasks.length,
      completed,
      open,
      bugs,
      features,
    };
  });

  const totalReadyAnchors = anchors.filter((a) => Boolean(a.url && a.url.trim())).length;

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
        aria-labelledby="team-folder-title"
        className="w-full max-w-2xl my-8 rounded-2xl border border-surface-border bg-surface-card p-6 shadow-2xl relative text-content-primary motion-safe:transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-accent/40 bg-brand-accent/10 font-mono text-brand-accent shadow-glow-accent"
              aria-hidden="true"
            >
              <FolderGit2 className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="team-folder-title" className="font-heading text-lg font-bold tracking-tight text-content-primary">
                  Team Folder & Workspace Roster
                </h3>
                <span className="font-mono text-xs text-brand-primary border border-brand-primary/30 rounded px-1.5 py-0.5">
                  SOPRANO's crew
                </span>
              </div>
              <p className="text-xs text-content-muted">
                Teammate directory, GitHub handles, workload velocity, and sprint assets.
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

        {/* Content */}
        <div className="mt-5 space-y-6">
          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-surface-border bg-surface-page/50 p-3">
              <span className="text-[11px] font-mono text-content-muted uppercase">Active Crew</span>
              <p className="text-lg font-bold font-heading text-content-primary mt-0.5">{TEAM_MEMBERS.length} Engineers</p>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-page/50 p-3">
              <span className="text-[11px] font-mono text-content-muted uppercase">Deliverables Ready</span>
              <p className="text-lg font-bold font-heading text-type-feature mt-0.5">{totalReadyAnchors} of 4</p>
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-page/50 p-3">
              <span className="text-[11px] font-mono text-content-muted uppercase">Board Tasks</span>
              <p className="text-lg font-bold font-heading text-brand-primary mt-0.5">{tasks.length} Tracked</p>
            </div>
          </div>

          {/* Teammates Roster */}
          <div>
            <h4 className="text-xs font-mono font-medium text-content-primary uppercase tracking-wider mb-3">
              Teammate Workload Directory
            </h4>
            <div className="space-y-3">
              {memberStats.map((member) => (
                <div
                  key={member.name}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface-page/70 p-3.5 hover:border-brand-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-primary/40 bg-brand-primary/10 font-mono text-xs font-bold text-brand-primary">
                      {member.initials}
                    </span>
                    <div>
                      <h5 className="font-heading text-sm font-semibold text-content-primary">
                        {member.name}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-xs text-content-muted">
                        <span className="text-brand-accent flex items-center gap-0.5">
                          <AtSign className="h-3 w-3" />
                          {member.handle.replace('@', '')}
                        </span>
                        <span>•</span>
                        <span>{member.total} {member.total === 1 ? 'task' : 'tasks'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Task distribution breakdown */}
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="inline-flex items-center gap-1 rounded border border-type-feature/30 bg-type-feature/10 px-2 py-0.5 text-[11px] text-type-feature">
                      <Sparkles className="h-3 w-3" />
                      {member.features}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded border border-type-bug/30 bg-type-bug/10 px-2 py-0.5 text-[11px] text-type-bug">
                      <Bug className="h-3 w-3" />
                      {member.bugs}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded border border-surface-border bg-surface-card px-2 py-0.5 text-[11px] text-content-muted">
                      <Clock className="h-3 w-3" />
                      {member.open} open
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-surface-border flex items-center justify-between">
          <p className="text-xs font-mono text-content-muted">
            Project repository: <span className="text-content-primary">LegionerLeonid99/vibecoding-project-tracker</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-surface-page border border-surface-border px-4 py-2 text-sm font-medium text-content-primary hover:bg-surface-card transition-colors"
          >
            Close Folder
          </button>
        </div>
      </div>
    </div>
  );
}
