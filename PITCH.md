# VibeTracker — Hackathon Pitch & Demo Script (Milestone 13: `pitch-ready`)

**Team:** SOPRANO's Crew  
**Lead Operator:** Daniil Osadcenco ([@LegionerLeonid99](https://github.com/LegionerLeonid99))  
**Hackathon:** UXD Vibecoding Hackathon 2026 · Prof. Dr. Ignacio Alvarez  
**Theme:** Professional & Futuristic Dark Obsidian (`#0B0F19`, `#111827`, `#22D3EE`, `#374151`)  
**Deployment / Local URL:** `http://localhost:5173`  
**Git Tag:** `pitch-ready`

---

## 1. Executive Summary & Hook (30 Seconds)

> **"Vibecoding is fast, but context rot is real.**  
> Standard Kanban boards track *where* a task is, but they throw away the *prompts and context* that generated the code. When an agent loses context or a teammate takes over, you waste 20 minutes reconstructing the prompt history.  
>  
> We built **VibeTracker**: a cyber-grade project command center that treats **AI Prompt Context as a first-class deliverable**. It doesn't just manage tasks—it structures, budgets, enhances, and serializes prompt context directly for LLMs like Claude 3.7 Sonnet, ChatGPT 4o, and Gemini 2.5 Pro."

---

## 2. The 3-Minute Live Pitch & Demo Walkthrough

### ⏱ 0:00 – 0:45 | Pinned Deliverable Anchors & Core Kanban (M4–M8, M11)
- **Visuals on Screen:** Pinned Anchor Board at the top, glowing 4-column Kanban board below.
- **Talking Points:**
  - *"At the very top, notice our **Deliverable Anchor Board** (`M11: project-deliverables`). In a 3-hour hackathon, losing sight of the four core deliverables (Presentation, Live Demo, Final Report, Repo Documentation) means failure. Our anchor board keeps team progress pinned in plain view with real-time status and health badges."*
  - *"Below is our full 4-stage pipeline: **Backlog, In Progress, Review, and Done** (`M4: data-model`)."*
  - *"Notice the visual markers: **Features vs. Bugs** (`M6: tag-style`) with high-contrast cyan and rose badges complying with **WCAG 2.2 AA standards**."*
  - *"Look at the task cards (`M8: due-tint`): tasks approaching their deadline dynamically tint from cyan to amber to pulsing red, with clear countdown indicators (`Due in 2h`, `OVERDUE`)."*
  - *"Each card features an operator badge (`M7: task-owner`) with an instant handoff selector to transfer ownership smoothly."*

### ⏱ 0:45 – 1:45 | The Hero Feature: Prompt Context Engine (M9 & M10)
- **Action:** Click to open the hero card: `Build AI Prompt Enhancer & Context Engine`.
- **Talking Points:**
  - *"Now let’s look at why this is a true vibecoding tracker (`M9: task-context`)."*
  - *"Inside the task modal, every card has a dedicated **Curated Prompt Context briefing** area with target AI tool selection (`Claude 3.7 Sonnet`, `ChatGPT 4o`, `Gemini 2.5 Pro`, `Cursor`)."*
  - *"When an engineer or designer is ready to ship, they don't manually summarize files and constraints. One click on **'Copy as Prompt Context'** (`M10: copy-prompt`) formats a clean, standardized Markdown briefing containing task objective, stage, owner, acceptance criteria, and exact instructions ready to paste into any LLM."*
  - *(Click 'Copy as Prompt Context' → show the cyber toast confirmation: `Prompt context copied to clipboard!`).*

### ⏱ 1:45 – 2:30 | Secret Sauce: The Cyber Suite (M12)
- **Action 1:** Drag a card from *In Progress* to *Review* or *Done*.
  - *"For Milestone 12 (`secret-sauce`), we implemented our **Full Cyber Suite**:"*
  - *"1. **Native Fluid Drag & Drop**: Cards lift with tactile pop animations, and columns glow cyan upon hovering."*
- **Action 2:** Open the **Team Folder** drawer from the top header.
  - *"2. **Team Folder Command Center**: Gives leadership immediate visibility into crew velocity, active tasks, deliverable readiness (4/4 ready), and member workload breakdown."*
- **Action 3:** Open the **Operator Profile** modal (`DO @LegionerLeonid99`).
  - *"3. **Operator Registration**: Quick onboarding with full name, email, and normalized GitHub account tag (`@LegionerLeonid99`) persisted to local storage."*
- **Action 4:** Re-open the Task Modal and highlight the **TACO Prompt Enhancer & Token Budget Meter**.
  - *"4. **TACO Auto-Framer**: Grounded directly in Prof. Alvarez's prompt engineering lectures, clicking 'Enhance (TACO)' transforms raw rough notes into a structured prompt framework: **Task, Actor, Context, and Output format**."*
  - *"5. **Context Token Budget Meter**: Monitors prompt volume in real-time (`Green <1k`, `Amber 1k-3k`, `Red >3k tokens`) to protect models from the 'attention valley' and memory loss."*

### ⏱ 2:30 – 3:00 | Architecture & Conclusion
- **Talking Points:**
  - *"Built on **Vite + React + Tailwind CSS**, zero bloat, WCAG 2.2 AA accessible, keyboard navigable with full ARIA landmarks, and 100% locally persisted."*
  - *"VibeTracker turns prompt context from a forgotten side-effect into the core asset of your engineering pipeline."*
  - *"Thank you! We're ready for questions."*

---

## 3. Demo Click-Through Checklist for the Speaker

| Step | Component | Action | Expected Visual |
|---|---|---|---|
| 1 | Header | Point to **VibeTracker** logo, Operator chip (`DO @LegionerLeonid99`), and Team Folder button | Dark Obsidian HUD styling |
| 2 | Anchor Board | Review the 4 Deliverable anchors | 4/4 Ready badges with progress bar |
| 3 | Kanban Board | Hover over cards | Tactile lift (`-translate-y-0.5`), glow borders |
| 4 | Drag & Drop | Drag card `Build AI Prompt Enhancer` to `Done` | Drop zone glow + Toast confirmation |
| 5 | Team Folder | Click **"Team Folder"** in header | Crew velocity, workload stats, repo link |
| 6 | Profile | Click **Operator Chip** (`@LegionerLeonid99`) | Operator registration modal opens |
| 7 | Task Modal | Open `Refactor Navigation Bar` | Task modal with Context area & Token Meter |
| 8 | TACO Enhancer | Click **"Enhance (TACO)"** | Context text automatically structured into TACO |
| 9 | Copy Context | Click **"Copy as Prompt Context"** | Toast: `Prompt context copied to clipboard!` |

---

## 4. Key Differentiators Table (Cheat Sheet for Judges)

| Capability | Generic Kanban (Trello/Jira) | VibeTracker |
|---|---|---|
| **Prompt Engineering Support** | None (plain text description) | **TACO Auto-Framer** + Target LLM selector |
| **Context Window Monitoring** | None | **Live Token Budget Meter** (Green/Amber/Red) |
| **Agent Handoff** | Manual link pasting | **1-Click Markdown Serializer** (`Copy as Prompt Context`) |
| **Hackathon Deliverables** | Buried in sub-tasks | **Pinned Deliverable Anchor Board** |
| **Design Language** | Standard corporate light/gray | **Obsidian Futuristic Dark Theme** (WCAG 2.2 AA) |
| **Persistence** | Requires external database | **Zero-latency LocalStorage engine** |

---

## 5. Milestone 13 Verification Checklist

- [x] All 12 previous milestones tagged on remote (`prd-done` through `secret-sauce`)
- [x] Mock tasks loaded across all four columns with realistic hackathon context
- [x] Production build passes cleanly (`npm run build` in 1.25s)
- [x] Pitch script timed for 3-minute presentation limit
- [x] Ready to tag `pitch-ready`
