import { useMemo, useState } from 'react';
import AnchorBoard from './components/AnchorBoard.jsx';
import AppHeader from './components/AppHeader.jsx';
import Board from './components/Board.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import DueFilterDropdown from './components/DueFilterDropdown.jsx';
import TaskFilterBar from './components/TaskFilterBar.jsx';
import TaskModal from './components/TaskModal.jsx';
import TeamFolderModal from './components/TeamFolderModal.jsx';
import Toast from './components/Toast.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import {
  DEFAULT_ANCHORS,
  DEFAULT_USER,
  SEED_TASKS,
  STORAGE_KEYS,
  createTask,
  getDueState,
  normalizeAnchors,
  normalizeTask,
  normalizeTasks,
  serializeTaskToPrompt,
} from './data/taskModel.js';

/**
 * Vibecoding Project Tracker — starter scaffold.
 *
 * This file connects state, storage, and the board.
 *
 * Where to start (build sequence in Phase 3):
 *   - M4  data-model    : render the four columns and the task cards. (DONE)
 *   - M5  crud-modal    : add the "+" button modal and the edit-on-click modal (DONE).
 *   - M6  tag-style     : feature vs. bug color coding (uses DESIGN.md §2 colors) (DONE).
 *   - M7  task-owner    : assignee badge + "Hand off to..." dropdown (DONE).
 *   - M8  due-tint      : color cards by due date (uses DESIGN.md §2 due-state colors) (DONE).
 *   - M9  context       : a curated Context briefing field on the modal (DONE).
 *   - M10 copy-prompt   : a "Copy as Prompt Context" button that serializes the task + context (DONE).
 *   - M11 anchors       : the Anchor Board above the Kanban (DONE).
 *   - M12 secret-sauce  : the one open-ended thing that makes your tracker yours.
 *
 * Search the file for `TODO M<n>` to find the right hook for each milestone.
 */

// Re-exported so existing imports from './App.jsx' keep working.
export { STAGES, TEAM } from './data/taskModel.js';
export { useLocalStorage } from './hooks/useLocalStorage.js';

export default function App() {
  // Persisted task list, seeded with mock tasks on first load.
  const [storedTasks, setTasks] = useLocalStorage(STORAGE_KEYS.tasks, SEED_TASKS);

  // Modal state for M5 crud-modal
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    mode: 'create', // 'create' | 'edit'
    task: null,
    initialStatus: 'todo',
  });

  // Never trust storage blindly — coerce every record into a valid Task.
  const tasks = useMemo(() => normalizeTasks(storedTasks), [storedTasks]);

  // Card filters (QoL) — view-only: they change what the board renders,
  // never what is stored. Stats below stay global on purpose.
  const [typeFilter, setTypeFilter] = useState('all');
  const [dueFilter, setDueFilter] = useState('any');
  const visibleTasks = useMemo(() => {
    let list = tasks;
    if (typeFilter !== 'all') list = list.filter((t) => t.type === typeFilter);
    if (dueFilter !== 'any') {
      list = list.filter((t) => {
        const state = getDueState(t.dueDate, t.status).state;
        // 'overdue' → past due; 'due' → upcoming deadline ('warning' + 'safe').
        return dueFilter === 'overdue'
          ? state === 'overdue'
          : state === 'warning' || state === 'safe';
      });
    }
    return list;
  }, [tasks, typeFilter, dueFilter]);

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.status === 'done').length;
    return { total: tasks.length, open: tasks.length - done, done };
  }, [tasks]);

  // CRUD Handlers (M5 `crud-modal`)
  const handleOpenCreate = (initialStatus = 'todo') => {
    setModalConfig({
      isOpen: true,
      mode: 'create',
      task: null,
      initialStatus,
    });
  };

  const handleOpenEdit = (task) => {
    setModalConfig({
      isOpen: true,
      mode: 'edit',
      task,
      initialStatus: task.status,
    });
  };

  const handleCloseModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSaveTask = (taskData) => {
    if (modalConfig.mode === 'create') {
      const newTask = createTask(taskData);
      setTasks((prev) => [newTask, ...(Array.isArray(prev) ? prev : [])]);
    } else if (modalConfig.mode === 'edit' && modalConfig.task) {
      setTasks((prev) =>
        (Array.isArray(prev) ? prev : []).map((t) =>
          t.id === modalConfig.task.id ? normalizeTask({ ...t, ...taskData }) : t
        )
      );
    }
  };

  // Toast notification state (M7 `task-owner`)
  const [toastMessage, setToastMessage] = useState(null);

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => (Array.isArray(prev) ? prev : []).filter((t) => t.id !== taskId));
  };

  // Handoff Handler (M7 `task-owner`)
  const handleHandoffTask = (taskId, newAssignee) => {
    setTasks((prev) =>
      (Array.isArray(prev) ? prev : []).map((t) =>
        t.id === taskId ? normalizeTask({ ...t, assignee: newAssignee }) : t
      )
    );
    // DESIGN.md §5 exact microcopy: "Task handed off to {name}."
    setToastMessage(`Task handed off to ${newAssignee}.`);
  };

  // M10 `copy-context` / `copy-prompt`: Copy serialized markdown to clipboard
  const handleCopyPrompt = async (task) => {
    const promptText = serializeTaskToPrompt(task);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(promptText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = promptText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      // DESIGN.md §5 exact microcopy: "Prompt context copied to clipboard. Ready for AI chat."
      setToastMessage('Prompt context copied to clipboard. Ready for AI chat.');
    } catch (err) {
      console.error('Failed to copy prompt context to clipboard:', err);
    }
  };

  // M11 `project-deliverables` / `anchors`: Deliverable Anchor Board
  const [storedAnchors, setAnchors] = useLocalStorage(STORAGE_KEYS.anchors, DEFAULT_ANCHORS);
  const anchors = useMemo(() => normalizeAnchors(storedAnchors), [storedAnchors]);

  const handleSaveAnchorUrl = (anchorId, url) => {
    setAnchors((prev) => {
      const list = Array.isArray(prev) ? prev : DEFAULT_ANCHORS;
      return list.map((a) => (a.id === anchorId ? { ...a, url } : a));
    });
  };

  // M12 `secret-sauce`: User registration profile & Team Folder
  const [user, setUser] = useLocalStorage(STORAGE_KEYS.user, DEFAULT_USER);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTeamFolderOpen, setIsTeamFolderOpen] = useState(false);

  // M12 `secret-sauce`: Drag-and-drop task movement
  const handleMoveTask = (taskId, targetStatus) => {
    setTasks((prev) =>
      (Array.isArray(prev) ? prev : []).map((t) =>
        t.id === taskId ? normalizeTask({ ...t, status: targetStatus }) : t
      )
    );
    const targetStage = STAGES.find((s) => s.id === targetStatus)?.label || targetStatus;
    setToastMessage(`Task moved to ${targetStage}.`);
  };

  return (
    <div className="min-h-screen bg-surface-page">
      {/* WCAG 2.4.1 Bypass Blocks */}
      <a
        href="#board"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-primary focus:px-4 focus:py-2 focus:font-semibold focus:text-surface-page"
      >
        Skip to board
      </a>

      <AppHeader
        onNewTask={() => handleOpenCreate('todo')}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenTeamFolder={() => setIsTeamFolderOpen(true)}
        currentUser={user}
      />

      <main className="mx-auto max-w-[90rem] px-8 py-8">
        {/* M11 project-deliverables: Deliverable Anchor Board pinned above Kanban */}
        <AnchorBoard anchors={anchors} onSaveUrl={handleSaveAnchorUrl} />

        <section aria-labelledby="board-heading">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-brand-primary">Command center</p>
              <h2 id="board-heading" className="mt-1 font-heading text-2xl font-semibold tracking-tight text-content-primary">
                Project board
              </h2>
              <p className="mt-1 text-sm text-content-muted">Project tracking for vibecoders.</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <TaskFilterBar value={typeFilter} onChange={setTypeFilter} />
                <DueFilterDropdown value={dueFilter} onChange={setDueFilter} />
              </div>
            </div>

            <dl className="flex items-center gap-2 font-mono text-xs">
              {[
                ['Total', stats.total],
                ['Open', stats.open],
                ['Done', stats.done],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-card px-3 py-1.5"
                >
                  <dt className="uppercase tracking-wider text-content-muted">{label}</dt>
                  <dd className="font-medium text-content-primary">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Board
            tasks={visibleTasks}
            onEditTask={handleOpenEdit}
            onAddTask={(stageId) => handleOpenCreate(stageId)}
            onHandoffTask={handleHandoffTask}
            onCopyPrompt={handleCopyPrompt}
            onMoveTask={handleMoveTask}
          />
        </section>
      </main>

      {/* M5 CRUD Modal + M9 Context + M10 Copy Prompt + M12 TACO */}
      <TaskModal
        isOpen={modalConfig.isOpen}
        mode={modalConfig.mode}
        initialTask={modalConfig.task}
        initialStatus={modalConfig.initialStatus}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onCopyPrompt={handleCopyPrompt}
      />

      {/* M12 Secret Sauce: Profile & Team Folder Modals */}
      <ProfileModal
        isOpen={isProfileOpen}
        currentUser={user}
        onClose={() => setIsProfileOpen(false)}
        onSave={(updatedUser) => {
          setUser(updatedUser);
          setToastMessage(`Profile saved. Welcome, ${updatedUser.name}!`);
        }}
      />

      <TeamFolderModal
        isOpen={isTeamFolderOpen}
        tasks={tasks}
        anchors={anchors}
        onClose={() => setIsTeamFolderOpen(false)}
      />

      {/* M7 Handoff & M10 Copy Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
