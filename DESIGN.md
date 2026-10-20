# Vibecoding Project Tracker — Design

**Status:** Completed · ready for `design-done`.

**Why this file exists.** This tracker is your tool. It should look like *your* tool — not a generic Kanban with default Tailwind blue. Twenty minutes of design decisions here will be visible on every screen for the next six weeks of Module 5.

**Who owns this.** Person B, during the same window the rest of the team is reviewing the PRD. By the time the team converges to start M4 (`data-model`), this file should be filled in and the colors should already be in `tailwind.config.js`.

---

## 1. Mood / vibe

One sentence that captures the feeling the tracker should leave you with:

`A high-precision, dark-mode command center engineered for high-velocity vibecoding.`

Two or three references that capture the vibe:

- `https://dribbble.com/shots/25154496-Stick-Kanban-Design`
- `https://dribbble.com/shots/26263392-Swift-Kanban-Board`
- `https://dribbble.com/shots/17873566-AI-Task-Management-Dashboard`

Anti-references — what we are explicitly **not** trying to look like:

- `https://dribbble.com/shots/21904451-Minimal-Kanban-Board`
- `https://dribbble.com/shots/20973715-ToDo-App-Kanban-Board-Gantt-chart`
- `https://dribbble.com/shots/24904805-Task-Kanban-Board`

## 2. Color palette

WCAG 2.2 AA/AAA-compliant high-contrast palette calibrated against dark obsidian surfaces.

### Brand

| Token | Hex | Where it shows up |
|---|---|---|
| `brand-primary` | `#22D3EE` | Header glow, primary button fills, focus indicators (12.4:1 with dark text) |
| `brand-accent` | `#60A5FA` | Secondary highlights, links, active tab borders (6.4:1 contrast) |
| `surface-page` | `#0B0F19` | Deep obsidian page background |
| `surface-card` | `#111827` | Slate-900 elevated card container surface |
| `text-primary` | `#F9FAFB` | Card titles and main headings (16.5:1 contrast against card) |
| `text-muted` | `#9CA3AF` | Slate gray for timestamps, dates, subtitles (5.8:1 contrast) |

### Task type (M6 `tag-style`)

| Token | Hex | When used |
|---|---|---|
| `type-feature` | `#34D399` | Emerald-400 accent for feature badges & icons (9.1:1 contrast) |
| `type-bug` | `#FB7185` | Rose-400 alert accent for bug badges & icons (6.4:1 contrast) |

### Due-date states (M8 `due-tint`)

| Token | Hex | When used |
|---|---|---|
| `due-safe` | `#38BDF8` | Sky-400 for tasks due >2 days out (8.2:1 contrast) |
| `due-warning` | `#FBBF24` | Amber-400 for tasks due <24 hours (10.8:1 contrast) |
| `due-overdue` | `#F87171` | Red-400 critical tint for past due tasks (6.4:1 contrast) |
| `due-neutral` | `#94A3B8` | Slate-400 for completed tasks (5.4:1 contrast) |

## 3. Typography

| Role | Font | Why |
|---|---|---|
| Heading | `Plus Jakarta Sans, Inter, sans-serif` | Clean geometric lines with high-contrast character forms. |
| Body | `Inter, system-ui, sans-serif` | Tall x-height and open apertures ensuring WCAG readability. |
| Monospace (tags, badges, code) | `JetBrains Mono, Fira Code, monospace` | Unambiguous character distinctions for IDs, timestamps, and prompts. |

Suggested sizes (override only if the design demands it):

- Page title: 24 px / semibold
- Section header: 16 px / semibold uppercase
- Card title: 14 px / medium
- Body: 14 px / regular
- Caption: 12 px / regular muted

## 4. Component principles

One short sentence per element. These set the tone for the build phase — Person A's modal and Person B's anchor board should both feel like they came from this doc.

- **Cards:** Crisp slate-900 surface (`#111827`) with a 1px slate-700 border (`#374151`), subtle border glow on hover, and zero heavy drop-shadows.
- **Buttons:** Solid high-contrast fill (`#22D3EE` background with dark `#0B0F19` text), rounded-lg, crisp tactile hover states.
- **Modal:** Centered, max-w-lg, deep obsidian background with `backdrop-blur-md` overlay at 60% opacity.
- **Empty states:** Clean 1px dashed slate-700 border, centered muted text, high-clarity status indicator.
- **Drag affordance (if used):** Clear cursor indicator with smooth transition effects between columns.

## 5. Voice / microcopy

Three lines of microcopy that capture the tone of the product. Keep it short — these are the words a stressed user reads at 11pm.

| Where | Text |
|---|---|
| "+" button label | `+ New Task` |
| Empty column placeholder | `No active tasks in this stage.` |
| Toast after "Copy as Prompt Context" | `Prompt context copied to clipboard. Ready for AI chat.` |
| Confirm-delete message | `Delete this task permanently? This cannot be undone.` |
| Handoff toast (M7 `task-owner`) | `Task handed off to {name}.` |

## 6. Logo / wordmark

The tracker probably doesn't need a logo, but it does need a name and a wordmark style.

- **Product name:** `VibeTracker` (by SOPRANO's crew)
- **Wordmark style:** `Bold geometric Plus Jakarta Sans in #F9FAFB with a cyan (#22D3EE) glowing status dot indicator.`

## 7. Out of scope (this hackathon)

To keep design tight, the following are explicitly not part of `design-done`:

- A dark mode toggle. Pick one mode and ship it.
- Multiple themes. One brand, applied consistently.
- Animations beyond a 200 ms fade on toast notifications.
- A custom icon set. Use [Lucide icons](https://lucide.dev) via Tailwind classes if you need any.

---

*DESIGN.md version: hackathon-starter v1 · updated for SOPRANO's crew v3*
