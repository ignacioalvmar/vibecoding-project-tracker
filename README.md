# Vibecoding Project Tracker — Hackathon Starter

You're forking this repo as the starting point for the **UXD Vibecoding Hackathon 2026**. The goal of the hackathon is to ship a Vibecoding Project Tracker in ~3 hours: a Kanban-style tool that tracks your vibecoding tasks and stores the prompts that produced them.

This starter gives you:

- A pre-written **PRD** (`PRD.md`) — read it. You don't write the PRD this year; your Milestone 2 is to review, fill in the team-specific TODOs, and commit.
- A **Vite + React + Tailwind** scaffold with the boilerplate already configured.
- The locked `Task` data model and `STAGES` constant in `src/App.jsx`.
- A `useLocalStorage` hook so persistence is one line.
- Empty TODO markers for every milestone, so AI tools can find them.

What you build, starting at M3:

- The four-column Kanban board.
- The add / edit / delete modal.
- The Prompt Context field (the differentiator).
- The "Copy as Prompt Context" button (the demo's hero moment).
- And everything else through M13.

## Quick start

```bash
# 1. Fork this repo on GitHub. Then clone YOUR fork:
git clone https://github.com/<your-team>/<your-fork>.git
cd <your-fork>

# 2. Install dependencies
npm install

# 3. Run the dev server
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). You should see a placeholder page with the team starter header and "Build the four-column board here · M3" in the middle. That's expected — M3 is your first build milestone.

## Milestone workflow

Every milestone ends with a git tag push. The Hackathon Portal dashboard watches your tags and updates the scoreboard in near real time.

```bash
git add .
git commit -m "<tag-name>"
git tag <tag-name>
git push --tags
```

Replace `<tag-name>` with the tag for the milestone you just finished — see the table below. Tag names are lowercase, hyphenated, exact.

| # | Tag | What it means |
|---|---|---|
| 1 | `git-linked` | Repo registered on the portal, webhook delivers test ping |
| 2 | `prd-done` | PRD reviewed, team-specific TODOs filled in |
| 3 | `data-model` | Four-column board renders with 3-4 mock tasks |
| 4 | `crud-modal` | Add / edit / delete tasks via a modal, persisted to localStorage |
| 5 | `tag-style` | Feature vs. bug visual distinction |
| 6 | `due-tint` | Cards change color as deadlines approach |
| 7 | `prompt-ctx` | Prompt Context field saves and shows up on tasks |
| 8 | `copy-prompt` | One-click copy formatted prompt to clipboard |
| 9 | `anchors` | Deliverable Anchor Board pinned above the Kanban |
| 10 | `preview-link` | Live preview URL slot on each task |
| 11 | `driver` | Assignee badge + "Hand off to..." dropdown |
| 12 | `gh-fake` | Visual GitHub branch + PR status badge (faked) |
| 13 | `pitch-ready` | Demo dataset loaded, pitch rehearsed, video recorded |

## Repo map

```
.
├── PRD.md              ← READ THIS FIRST · review + fill in TODOs for M2
├── README.md           ← you are here
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── .gitignore
└── src/
    ├── main.jsx        ← React entry point — don't change
    ├── index.css       ← Tailwind directives — don't change
    └── App.jsx         ← all your code goes here (or split into more files)
```

## Deploy (any time after M3)

Vercel's free tier deploys a Vite + React app in one click:

1. Go to [vercel.com](https://vercel.com), sign in with GitHub.
2. Import your fork.
3. Accept the defaults (Vite is auto-detected). Click Deploy.
4. Drop the resulting URL into PRD §11 and into your team chat.

Re-deploys happen automatically on every push to `main`.

## A word about prompts

Once M7 (`prompt-ctx`) is done, log your real prompts inside the app itself. By the end of the hackathon you should have a handful of saved prompt contexts on real tasks — those become part of your Module 5 "Vibe Coding History" deliverable. Free credit, just by using your own tool.

---

*UXD Vibecoding Hackathon 2026 · Prof. Dr. Ignacio Alvarez · Vanchha Chandrayan*
