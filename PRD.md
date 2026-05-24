# Vibecoding Project Tracker — PRD

**Status:** Hackathon starter PRD · review and fill in the **`<TODO>`** sections before you tag `prd-done`.

---

## 1. Problem

UXD bachelors who vibecode their projects have two recurring pains:

1. **They lose track of tasks.** Three teammates, a hundred small things, no shared view. Nothing tells them what state each task is actually in.
2. **They lose track of prompts.** The AI gave them working code two days ago but no one remembers the prompt that produced it. When they need to iterate, they start from scratch.

A spreadsheet doesn't solve this. A real project tool (Linear, Jira, Notion) is overkill, doesn't know about prompts, and takes hours to set up.

## 2. Target users

- **Primary:** the three of us, for the remaining weeks of the summer semester.
- **Secondary:** future cohorts of UXD bachelors doing the same module.

We are designing the tool we ourselves will use. The pitch demo is also our first real user test.

## 3. Product overview

A single-page web app with two persistent surfaces:

- A **Kanban board** where vibecoding tasks move through four states.
- An **Anchor Board** above it that pins the four final-project deliverables (Presentation, Demo, Report, Documentation).

Each task carries the prompt context that produced it, so any teammate can click a button and copy the task + prompt history back into an AI chat to continue work.

## 4. Primary user flow

1. Open the app. The board loads from local storage.
2. Click "+" to add a task. Fill in title, type, assignee, due date, prompt context.
3. Move the task across columns as you work.
4. When stuck, click "Copy as Prompt Context" on a task and paste it into Claude/ChatGPT/Cursor to continue.
5. Hand off a task to a teammate with one dropdown.
6. Drop final deliverable links into the Anchor Board as you produce them.

## 5. Data model

Locked. Do not change without team agreement.

```js
// A single vibecoding task.
Task = {
  id: string,                    // uuid or timestamp string
  title: string,
  description: string,
  type: 'feature' | 'bug',       // visual color coding
  status: 'todo' | 'in-progress' | 'review' | 'done',
  assignee: string,              // one of the three teammate names from §8
  dueDate: string | null,        // ISO date 'YYYY-MM-DD'
  createdDate: string,           // ISO date 'YYYY-MM-DD'

  // Added in later milestones:
  promptContext: {               // M7 prompt-ctx
    prompt: string,              // the actual prompt text
    aiTool: string,              // 'Claude' | 'ChatGPT' | 'Cursor' | 'Lovable' | 'Replit' | 'Other'
    outcome: string,             // 'worked' | 'iterated' | 'scrapped'
  } | null,
  previewUrl: string | null,     // M10 preview-link
  githubBranch: string | null,   // M12 gh-fake
  prUrl: string | null,          // M12 gh-fake
  prStatus: 'draft' | 'open' | 'merged' | null,  // M12 gh-fake
}

// One of four pinned deliverable slots.
Anchor = {
  id: 'presentation' | 'demo' | 'report' | 'documentation',
  label: string,                 // human-readable
  url: string | null,            // the link the team pastes in
}
```

## 6. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React (via Vite) | What the scaffold ships with. Don't migrate. |
| Styling | Tailwind | Already configured. Use utility classes; no separate CSS files. |
| State | React `useState` + a `useLocalStorage` hook | Simple, no library needed. |
| Persistence | **localStorage** | Zero infra. Pick this. Do not switch to a backend mid-hackathon. |
| Deploy | Vercel | One-click deploy from GitHub. |

> **Decision:** localStorage, not a shared backend. If you want a shared backend later, that's M14 — out of scope for the hackathon.

## 7. Stage names

Four columns, in this order, with these exact labels in the UI:

1. **To Do**
2. **In Progress**
3. **Review**
4. **Done**

## 8. Team

Fill these in before tagging `prd-done`:

| Slot | Name | GitHub handle |
|---|---|---|
| Teammate A | `<TODO>` | `<TODO>` |
| Teammate B | `<TODO>` | `<TODO>` |
| Teammate C | `<TODO>` | `<TODO>` |

These three names become the **only** allowed values for `Task.assignee`. No auth — just a dropdown.

## 9. Milestone ownership

Fill in the owner column. Recommended default in **bold**; change if your team has different strengths.

| # | Tag | Title | Suggested owner | Final owner |
|---|---|---|---|---|
| 3 | `data-model` | Task model + board view | **A** | `<TODO>` |
| 4 | `crud-modal` | Add / edit / delete modal | **A** | `<TODO>` |
| 5 | `tag-style` | Feature / bug colors | **B** | `<TODO>` |
| 6 | `due-tint` | Due-date color tinting | **B** | `<TODO>` |
| 7 | `prompt-ctx` | Prompt context field | **C** | `<TODO>` |
| 8 | `copy-prompt` | Copy-to-prompt button | **C** | `<TODO>` |
| 9 | `anchors` | Deliverable Anchor Board | **B** | `<TODO>` |
| 10 | `preview-link` | Live preview URL slot | **B** | `<TODO>` |
| 11 | `driver` | Driver + handoff | **A** | `<TODO>` |
| 12 | `gh-fake` | GitHub mock badge | **C** | `<TODO>` |
| 13 | `pitch-ready` | Demo + pitch rehearsal | **All** | `<TODO>` |

Track A owns the state model. Track B owns the visuals. Track C owns the differentiator features (M7 + M8 — the prompt context pair). Put your strongest prompter on Track C.

**Dependency note.** M5 / M6 / M9 / M10 / M11 / M12 all depend on M3 + M4 being done first. While Person A builds M3+M4 (first ~60 min), Person B should set up Tailwind tokens and the Anchor Board mockup, Person C should draft the Markdown template for the "Copy as Prompt Context" output.

## 10. AI / vibe coding angle

Where AI will be heavily used:
- M3, M4: scaffold the board and the modal from a single prompt each.
- M7, M8: write the Markdown serialization helper.
- M11: animation polish for the handoff toast.

Where AI will **not** save you time:
- M2 (this PRD review) — read it yourself.
- M13 (pitch) — write the script in your own voice.

Log your prompts inside the app itself once M7 is done. This becomes part of the Module 5 "Vibe Coding History" deliverable.

## 11. Team identity

Fill in:

- **Team name:** `<TODO>`
- **Tagline (one sentence):** `<TODO>`
- **Tracker URL after deploy:** `<TODO>` (Vercel will give it to you)

## 12. Out of scope (do not build)

- Authentication / accounts.
- Real GitHub integration (M12 is a visual mock only).
- Mobile responsive — desktop only is fine.
- Multi-team support.
- Real-time collaboration.
- Any backend.

## 13. Definition of done

The hackathon is "done" when all 13 milestone tags are pushed to your repo and visible on the dashboard. The pitch is "done" when:

- The board loads on Vercel without errors.
- The "Copy as Prompt Context" demo works on stage.
- One paragraph pitch is written.
- A 60-second backup demo video has been recorded.

---

*PRD version: hackathon-starter v1 · maintained by Prof. Dr. Ignacio Alvarez*
