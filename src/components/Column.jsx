import { useState } from 'react';
import { Circle, CircleCheck, CircleDot, Eye, Inbox, Plus } from 'lucide-react';
import TaskCard from './TaskCard.jsx';

/**
 * Per-stage accent (header icon + 2px underline), echoing the Stick
 * reference's colour-coded column headers. Full class strings are listed so
 * Tailwind's JIT can see them. Every column also has a text label + unique
 * icon, so colour is never the only differentiator (WCAG 1.4.1).
 */
const STAGE_STYLE = {
  todo: { Icon: Circle, icon: 'text-content-muted', bar: 'border-content-muted' },
  'in-progress': { Icon: CircleDot, icon: 'text-brand-primary', bar: 'border-brand-primary' },
  review: { Icon: Eye, icon: 'text-brand-accent', bar: 'border-brand-accent' },
  done: { Icon: CircleCheck, icon: 'text-type-feature', bar: 'border-type-feature' },
};

/** DESIGN.md §4 empty state + §5 microcopy. */
function EmptyColumn() {
  return (
    <div className="flex min-h-[9rem] flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-surface-border px-4 py-8 text-center">
      <Inbox aria-hidden="true" className="h-5 w-5 text-content-muted" />
      <p className="text-xs text-content-muted">No active tasks in this stage.</p>
    </div>
  );
}

/**
 * @param {{
 *   stage: { id: import('../data/taskModel.js').TaskStatus, label: string },
 *   tasks: import('../data/taskModel.js').Task[],
 *   onEditTask?: (task: import('../data/taskModel.js').Task) => void,
 *   onAddTask?: (stageId: import('../data/taskModel.js').TaskStatus) => void,
 *   onHandoffTask?: (taskId: string, newAssignee: string) => void,
 *   onCopyPrompt?: (task: import('../data/taskModel.js').Task) => void,
 *   onMoveTask?: (taskId: string, targetStatus: import('../data/taskModel.js').TaskStatus) => void,
 * }} props
 */
export default function Column({
  stage,
  tasks,
  onEditTask,
  onAddTask,
  onHandoffTask,
  onCopyPrompt,
  onMoveTask,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const style = STAGE_STYLE[stage.id];
  const headingId = `column-${stage.id}-heading`;
  const count = tasks.length;

  return (
    <section aria-labelledby={headingId} className="flex min-w-0 flex-col">
      <header className={`flex items-center justify-between border-b-2 px-1 pb-3 ${style.bar}`}>
        <div className="flex items-center gap-2.5">
          <style.Icon aria-hidden="true" className={`h-4 w-4 shrink-0 ${style.icon}`} strokeWidth={2.25} />
          <h3 id={headingId} className="font-heading text-base font-semibold uppercase tracking-wide text-content-primary">
            {stage.label}
            <span className="sr-only">, {count} {count === 1 ? 'task' : 'tasks'}</span>
          </h3>
          <span
            aria-hidden="true"
            className="ml-1 rounded-md border border-surface-border bg-surface-card px-2 py-0.5 font-mono text-xs font-medium text-content-primary"
          >
            {count}
          </span>
        </div>

        {onAddTask && (
          <button
            type="button"
            onClick={() => onAddTask(stage.id)}
            aria-label={`Add task to ${stage.label}`}
            className="rounded-lg p-1 text-content-muted hover:text-brand-primary hover:bg-surface-card transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </header>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          if (!isDragOver) setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const taskId = e.dataTransfer.getData('text/plain');
          if (taskId) {
            onMoveTask?.(taskId, stage.id);
          }
        }}
        className={`mt-3 flex flex-1 flex-col rounded-2xl border p-2.5 motion-safe:transition-all motion-safe:duration-200 ${
          isDragOver
            ? 'border-brand-primary/80 bg-brand-primary/10 ring-2 ring-brand-primary/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
            : 'border-surface-border/60 bg-surface-card/40'
        }`}
      >
        {isDragOver && (
          <div className="mb-2 rounded-lg border border-dashed border-brand-primary/60 bg-brand-primary/10 p-2 text-center text-xs font-mono text-brand-primary animate-pulse">
            Drop task to move to {stage.label}
          </div>
        )}
        {count === 0 ? (
          <EmptyColumn />
        ) : (
          <ul role="list" className="flex flex-col gap-2.5">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onHandoff={onHandoffTask}
                onCopyPrompt={onCopyPrompt}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
