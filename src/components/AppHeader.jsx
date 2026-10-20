import { AtSign, FolderGit2, HardDrive, Plus, User } from 'lucide-react';

/**
 * Top bar with the DESIGN.md §6 wordmark: bold Plus Jakarta Sans in
 * #F9FAFB with a glowing cyan status dot, team folder button, registered user profile,
 * and the primary "+ New Task" button with tactile popping animations.
 *
 * @param {{
 *   onNewTask: () => void,
 *   onOpenProfile: () => void,
 *   onOpenTeamFolder: () => void,
 *   currentUser: { name: string, email: string, githubTag: string, initials?: string },
 * }} props
 */
export default function AppHeader({ onNewTask, onOpenProfile, onOpenTeamFolder, currentUser }) {
  const initials = currentUser?.initials || 'DO';
  const tag = currentUser?.githubTag || '@LegionerLeonid99';

  return (
    <header className="border-b border-surface-border bg-surface-page/80 backdrop-blur">
      <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-4 px-8 py-3.5">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-brand-primary shadow-dot-primary" />
          <h1 className="font-heading text-xl font-extrabold tracking-tight text-content-primary">VibeTracker</h1>
          <p className="border-l border-surface-border pl-3 font-mono text-xs text-content-muted">
            by SOPRANO&apos;s crew
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Team Folder Action (M12 Secret Sauce) */}
          <button
            type="button"
            onClick={onOpenTeamFolder}
            title="Open Team Folder & Teammate Workload Directory"
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs font-mono font-medium text-content-primary hover:border-brand-accent/60 hover:text-brand-accent transition-all hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-brand-accent"
          >
            <FolderGit2 aria-hidden="true" className="h-4 w-4 text-brand-accent" />
            <span>Team Folder</span>
          </button>

          {/* User Registration Profile Chip (M12 Secret Sauce) */}
          <button
            type="button"
            onClick={onOpenProfile}
            title={`Registered: ${currentUser?.name || 'Daniil Osadcenco'} (${tag}) — Click to edit profile`}
            className="inline-flex items-center gap-2 rounded-lg border border-surface-border bg-surface-card px-2.5 py-1.5 text-xs font-mono text-content-primary hover:border-brand-primary/60 transition-all hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-brand-primary"
          >
            <span
              className="flex h-5 w-5 items-center justify-center rounded-md border border-brand-primary/40 bg-brand-primary/10 text-[10px] font-bold text-brand-primary"
              aria-hidden="true"
            >
              {initials}
            </span>
            <span className="hidden sm:inline text-brand-primary font-medium">{tag}</span>
          </button>

          {/* New Task Action */}
          <button
            type="button"
            onClick={onNewTask}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-3.5 py-2 text-sm font-semibold text-surface-page hover:bg-[#67e8f9] transition-all hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary shadow-glow-primary"
          >
            <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
            <span>+ New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
}
