/**
 * VibeTracker — data model (M4 `data-model`).
 *
 * Mirrors PRD.md §5 exactly. The shape is LOCKED — do not add, rename or
 * remove fields without team agreement. This module is pure data + pure
 * functions: no React, no Tailwind classes. Presentation lives in
 * `src/components/*`, so the model can be reused by M5 (modal), M10
 * (copy-prompt serializer) and M11 (anchors) without dragging UI along.
 */

/**
 * @typedef {'feature'|'bug'} TaskType
 * @typedef {'todo'|'in-progress'|'review'|'done'} TaskStatus
 * @typedef {'Claude'|'ChatGPT'|'Cursor'|'Lovable'|'Replit'|'Other'} ContextTool
 */

/**
 * A single vibecoding task (PRD §5).
 *
 * @typedef {Object} Task
 * @property {string}           id                uuid or timestamp string
 * @property {string}           title
 * @property {string}           description
 * @property {TaskType}         type              visual color coding (M6)
 * @property {TaskStatus}       status            which column the card lives in
 * @property {string}           assignee          one of TEAM (PRD §8)
 * @property {string|null}      dueDate           ISO 'YYYY-MM-DD'
 * @property {string}           createdDate       ISO 'YYYY-MM-DD'
 * @property {string}           context           M9 — curated briefing for the next AI / teammate
 * @property {ContextTool|null} contextTool       M9
 * @property {string|null}      contextUpdatedAt  M9 — ISO timestamp, set automatically on save
 */

/**
 * One of four pinned deliverable slots (PRD §5, used by M11).
 *
 * @typedef {Object} Anchor
 * @property {'presentation'|'demo'|'report'|'documentation'} id
 * @property {string}      label
 * @property {string|null} url
 */

// ─── Enumerations ────────────────────────────────────────────────────────────

/**
 * The four board columns, in render order, with the exact UI labels from
 * PRD §7. Use these IDs everywhere — do not invent new ones.
 */
export const STAGES = Object.freeze([
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
]);

/** @type {ReadonlyArray<TaskStatus>} */
export const STATUS_IDS = Object.freeze(STAGES.map((s) => s.id));

/** Task types with human labels (labels are what screen readers announce). */
export const TASK_TYPES = Object.freeze([
  { id: 'feature', label: 'Feature' },
  { id: 'bug', label: 'Bug' },
]);

/** @type {ReadonlyArray<TaskType>} */
export const TYPE_IDS = Object.freeze(TASK_TYPES.map((t) => t.id));

/** Allowed values for `Task.contextTool` (M9). */
export const CONTEXT_TOOLS = Object.freeze(['Claude', 'ChatGPT', 'Cursor', 'Lovable', 'Replit', 'Other']);

/**
 * Team roster from PRD §8. `name` is what gets stored in `Task.assignee`;
 * `handle` / `initials` are display helpers for M7 `task-owner`.
 * Add teammates here — they automatically become valid assignees.
 */
export const TEAM_MEMBERS = Object.freeze([
  { name: 'Daniil Osadcenco', handle: '@LegionerLeonid99', initials: 'DO' },
  { name: 'Teammate B', handle: '@teammate_b', initials: 'TB' },
  { name: 'Teammate C', handle: '@teammate_c', initials: 'TC' },
]);

/** The only valid values for `Task.assignee`. */
export const TEAM = Object.freeze(TEAM_MEMBERS.map((m) => m.name));

/** Default Anchor Board slots (M11). */
export const DEFAULT_ANCHORS = Object.freeze([
  { id: 'presentation', label: 'Presentation', url: null },
  { id: 'demo', label: 'Demo', url: null },
  { id: 'report', label: 'Report', url: null },
  { id: 'documentation', label: 'Documentation', url: null },
]);

/** Default registered user profile (M12 `secret-sauce`). */
export const DEFAULT_USER = Object.freeze({
  name: 'Daniil Osadcenco',
  email: 'daniil@vibecoding.dev',
  githubTag: '@LegionerLeonid99',
  initials: 'DO',
});

/** localStorage keys — namespaced so other localhost apps can't collide. */
export const STORAGE_KEYS = Object.freeze({
  tasks: 'vibetracker.tasks',
  anchors: 'vibetracker.anchors',
  user: 'vibetracker.user',
});

// ─── Date helpers (local time, never UTC — avoids off-by-one at midnight) ───

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** @param {Date} date @returns {string} 'YYYY-MM-DD' in the user's local time zone */
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** @returns {string} today as 'YYYY-MM-DD' */
export function todayISO() {
  return toISODate(new Date());
}

/** @param {number} days @returns {string} today ± n days as 'YYYY-MM-DD' */
export function isoDaysFromToday(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/**
 * Parse 'YYYY-MM-DD' as a *local* date (new Date('2026-10-20') would be UTC).
 * @param {string|null|undefined} iso
 * @returns {Date|null}
 */
export function parseISODate(iso) {
  if (typeof iso !== 'string' || !ISO_DATE_RE.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

// ─── Factories & validation ─────────────────────────────────────────────────

/** @returns {string} a collision-resistant id */
export function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Short, human-friendly ticket code for display (e.g. "#3F9A").
 * Derived from the id so it never needs to be stored separately.
 * @param {string} id
 */
export function shortId(id) {
  const clean = String(id).replace(/[^a-z0-9]/gi, '');
  return `#${clean.slice(-4).toUpperCase()}`;
}

/**
 * Build a fully-populated Task with safe defaults. M5's "+ New Task" modal
 * should call this rather than hand-building objects.
 *
 * @param {Partial<Task>} [fields]
 * @returns {Task}
 */
export function createTask(fields = {}) {
  return normalizeTask({
    id: createId(),
    createdDate: todayISO(),
    ...fields,
  });
}

const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback);
const oneOf = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);

/**
 * Coerce anything (e.g. stale or hand-edited localStorage JSON) into a valid
 * Task. Unknown fields are dropped; invalid enums fall back to defaults, so
 * one corrupt record can never crash the board.
 *
 * @param {any} raw
 * @returns {Task}
 */
export function normalizeTask(raw) {
  const t = raw && typeof raw === 'object' ? raw : {};
  const dueDate = parseISODate(t.dueDate) ? t.dueDate : null;
  const createdDate = parseISODate(t.createdDate) ? t.createdDate : todayISO();

  return {
    id: str(t.id) || createId(),
    title: str(t.title).trim() || 'Untitled task',
    description: str(t.description),
    type: oneOf(t.type, TYPE_IDS, 'feature'),
    status: oneOf(t.status, STATUS_IDS, 'todo'),
    assignee: oneOf(t.assignee, TEAM, TEAM[0]),
    dueDate,
    createdDate,
    context: str(t.context),
    contextTool: oneOf(t.contextTool, CONTEXT_TOOLS, null),
    contextUpdatedAt: str(t.contextUpdatedAt) || null,
  };
}

/** @param {any} list @returns {Task[]} */
export function normalizeTasks(list) {
  return Array.isArray(list) ? list.map(normalizeTask) : [];
}

// ─── Selectors ───────────────────────────────────────────────────────────────

/**
 * Board ordering inside a column: soonest due date first, undated tasks last,
 * then oldest-created first so new work doesn't jump the queue.
 * @param {Task} a @param {Task} b
 */
export function compareTasks(a, b) {
  if (a.dueDate !== b.dueDate) {
    if (a.dueDate === null) return 1;
    if (b.dueDate === null) return -1;
    return a.dueDate < b.dueDate ? -1 : 1;
  }
  return a.createdDate < b.createdDate ? -1 : a.createdDate > b.createdDate ? 1 : 0;
}

/**
 * Bucket tasks into the four columns. Every stage key is always present,
 * so the UI can render empty columns without null checks.
 *
 * @param {Task[]} tasks
 * @returns {Record<TaskStatus, Task[]>}
 */
export function groupTasksByStatus(tasks) {
  const groups = Object.fromEntries(STATUS_IDS.map((id) => [id, []]));
  for (const task of tasks) groups[task.status].push(task);
  for (const id of STATUS_IDS) groups[id].sort(compareTasks);
  return groups;
}

/** @param {string} name @returns {typeof TEAM_MEMBERS[number] | undefined} */
export function getTeamMember(name) {
  return TEAM_MEMBERS.find((m) => m.name === name);
}

/** @param {TaskType} id */
export function getTypeLabel(id) {
  return TASK_TYPES.find((t) => t.id === id)?.label ?? id;
}

/**
 * Normalizes an Anchor object (M11 `project-deliverables` / `anchors`).
 * @param {any} a
 * @returns {{ id: string, label: string, url: string | null }}
 */
export function normalizeAnchor(a) {
  if (!a || typeof a !== 'object') {
    return { id: 'presentation', label: 'Presentation', url: null };
  }
  const id = ['presentation', 'demo', 'report', 'documentation'].includes(a.id)
    ? a.id
    : 'presentation';
  const defaultItem = DEFAULT_ANCHORS.find((d) => d.id === id);
  const label = typeof a.label === 'string' && a.label.trim() ? a.label.trim() : (defaultItem?.label ?? id);
  const url = typeof a.url === 'string' && a.url.trim() ? a.url.trim() : null;
  return { id, label, url };
}

/**
 * Normalizes the full list of anchors. Ensures all 4 default slots exist.
 * @param {any} list
 * @returns {Array<{ id: string, label: string, url: string | null }>}
 */
export function normalizeAnchors(list) {
  const arr = Array.isArray(list) ? list : [];
  return DEFAULT_ANCHORS.map((def) => {
    const existing = arr.find((item) => item?.id === def.id);
    return existing ? normalizeAnchor(existing) : { ...def };
  });
}

/**
 * Formats a task and its context into a clean, paste-ready Markdown prompt
 * for AI tools (Claude, ChatGPT, Cursor, etc.) (M10 `copy-context` / `copy-prompt`).
 *
 * @param {Task} task
 * @returns {string} Markdown briefing
 */
export function serializeTaskToPrompt(task) {
  const typeLabel = getTypeLabel(task.type);
  const stage = STAGES.find((s) => s.id === task.status)?.label ?? task.status;
  const toolName = task.contextTool || 'AI Assistant';

  const sections = [
    `# [VibeTracker Briefing] ${task.title}`,
    `- **Task ID:** #${shortId(task.id)}`,
    `- **Type:** ${typeLabel}`,
    `- **Stage:** ${stage}`,
    `- **Assignee:** ${task.assignee}`,
    `- **Deadline:** ${task.dueDate || 'No hard deadline'}`,
    `- **Target AI:** ${toolName}`,
    '',
    `## Objective & Description`,
    task.description || '_No description provided._',
  ];

  if (task.context && task.context.trim()) {
    sections.push(
      '',
      `## Curated Prompt Context / Briefing`,
      `> Context configured for **${toolName}**${task.contextUpdatedAt ? ` (last updated ${task.contextUpdatedAt.slice(0, 10)})` : ''}:`,
      '',
      task.context.trim()
    );
  }

  sections.push(
    '',
    `---`,
    `*Instructions for ${toolName}: Review the objective and context briefing above. Please propose the immediate next steps, code implementation, or debugging plan adhering to clean design tokens and WCAG 2.2 accessibility.*`
  );

  return sections.join('\n');
}

/**
 * Enhances prompt notes using the lecture's TACO framework:
 * Task, Actor, Context, Output format (M12 `secret-sauce`).
 *
 * @param {string} title
 * @param {string} description
 * @param {string} rawContext
 * @param {string} [toolName]
 * @returns {string}
 */
export function formatTACOPrompt(title, description, rawContext, toolName = 'Claude') {
  const taskSummary = title?.trim() || 'Implement project requirement';
  const contextBody =
    rawContext?.trim() || description?.trim() || 'Active sprint task requiring implementation.';

  return [
    `### [TACO Prompt Frame for ${toolName}]`,
    `- **Task:** ${taskSummary}`,
    `- **Actor:** Principal Full-Stack Engineer and AI Pair Programmer with deep expertise in React, Tailwind CSS, and WCAG 2.2 accessibility.`,
    `- **Context:**`,
    `  ${contextBody.replace(/\n/g, '\n  ')}`,
    `- **Output Format:** Provide clean, production-ready code with diff explanations, TypeScript/JSDoc types, and confirm keyboard accessibility.`,
  ].join('\n');
}

/**
 * Estimates token count for a text string (~4 characters per token).
 * @param {string} text
 * @returns {number}
 */
export function estimateTokenCount(text) {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / 4);
}

/**
 * @typedef {'overdue' | 'warning' | 'safe' | 'neutral' | 'none'} DueState
 */

/**
 * Computes the due state according to DESIGN.md §2 (M8 `due-tint`):
 * - 'neutral' for completed tasks (status === 'done', DESIGN.md due-neutral #94A3B8)
 * - 'overdue' for tasks past due date (DESIGN.md due-overdue #F87171)
 * - 'warning' for tasks due within 24h / tomorrow (DESIGN.md due-warning #FBBF24)
 * - 'safe' for tasks due > 2 days out (DESIGN.md due-safe #38BDF8)
 * - 'none' for tasks without a due date
 *
 * @param {string|null} dueDate ISO 'YYYY-MM-DD'
 * @param {TaskStatus} [status]
 * @returns {{
 *   state: DueState,
 *   daysDiff: number|null,
 *   label: string,
 * }}
 */
export function getDueState(dueDate, status = 'todo') {
  if (status === 'done') {
    return { state: 'neutral', daysDiff: null, label: 'Completed' };
  }
  if (!dueDate) {
    return { state: 'none', daysDiff: null, label: 'No date' };
  }
  const date = parseISODate(dueDate);
  if (!date) {
    return { state: 'none', daysDiff: null, label: 'No date' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffMs = targetDate.getTime() - today.getTime();
  const daysDiff = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    const overdueDays = Math.abs(daysDiff);
    return {
      state: 'overdue',
      daysDiff,
      label: overdueDays === 1 ? '1d overdue' : `${overdueDays}d overdue`,
    };
  }
  if (daysDiff <= 1) {
    return {
      state: 'warning',
      daysDiff,
      label: daysDiff === 0 ? 'Due today' : '< 24h Left',
    };
  }
  return {
    state: 'safe',
    daysDiff,
    label: `Due in ${daysDiff}d`,
  };
}

// ─── Seed data (first load only — afterwards localStorage wins) ─────────────

/**
 * Mock tasks pre-populating all 4 due states (safe, warning, overdue, neutral)
 * as defined in DESIGN.md §2.
 *
 * @type {Task[]}
 */
export const SEED_TASKS = [
  {
    id: 'seed-0104',
    title: 'Build the add / edit task modal',
    description:
      'One modal for create and edit with every Task field, persisted to localStorage. Cyan primary action, backdrop-blur overlay.',
    type: 'feature',
    status: 'todo',
    assignee: TEAM[0],
    dueDate: isoDaysFromToday(3),
    createdDate: isoDaysFromToday(-1),
    context: 'Use accessible dialog semantics: role="dialog", aria-modal="true", and trap focus inside. When user hits Escape, close modal and restore focus.',
    contextTool: 'Cursor',
    contextUpdatedAt: isoDaysFromToday(-1),
  },
  {
    id: 'seed-0102',
    title: 'Refactor Assignee Dropdown Component',
    description:
      'Reassignment toast does not trigger visual feedback after update. Fix state synchronization.',
    type: 'bug',
    status: 'todo',
    assignee: TEAM[0],
    dueDate: isoDaysFromToday(-1),
    createdDate: isoDaysFromToday(-3),
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
  {
    id: 'seed-0105',
    title: 'Board loses tasks after a hard refresh',
    description:
      'localStorage hydrates after first render on some browsers, briefly showing an empty board. Read storage in the lazy initializer.',
    type: 'bug',
    status: 'in-progress',
    assignee: TEAM[0],
    dueDate: isoDaysFromToday(1),
    createdDate: isoDaysFromToday(-2),
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
  {
    id: 'seed-0107',
    title: 'Serialize task + context as an AI prompt',
    description:
      'Markdown formatter that turns a task and its curated context into a paste-ready briefing for Claude, ChatGPT or Cursor.',
    type: 'feature',
    status: 'todo',
    assignee: TEAM[0],
    dueDate: isoDaysFromToday(6),
    createdDate: isoDaysFromToday(-1),
    context: 'Format task briefing into clean Markdown with frontmatter and section dividers. Ensure Claude, ChatGPT and Cursor handle copy-paste gracefully without stripping whitespace.',
    contextTool: 'Claude',
    contextUpdatedAt: isoDaysFromToday(0),
  },
  {
    id: 'seed-0101',
    title: 'Lock WCAG 2.2 palette into Tailwind tokens',
    description:
      'DESIGN.md colours, typography and component principles mirrored in tailwind.config.js. All text pairs verified at AA or better.',
    type: 'feature',
    status: 'done',
    assignee: TEAM[0],
    dueDate: isoDaysFromToday(-2),
    createdDate: isoDaysFromToday(-3),
    context: '',
    contextTool: null,
    contextUpdatedAt: null,
  },
];
