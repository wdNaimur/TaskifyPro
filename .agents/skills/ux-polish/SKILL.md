---
name: ux-polish
description: >-
  Use this skill whenever auditing, reviewing, or implementing UI/UX polish in Taskify.
  Enforces usability heuristics, complete UI state handling, accessibility (a11y),
  Taskify design tokens, and friction elimination.
---

# UX & UI Polish Runbook

This skill provides a systematic framework for inspecting, refining, and polishing user experiences across the Taskify application. It applies industry-standard usability heuristics (Nielsen Norman Group), design system consistency, and modern interaction ergonomics.

---

## 1. Core Usability Heuristics & Standards

When building or reviewing any screen, audit against these 5 pillars:

### Pillar 1: Visibility of System Status (NN/g Heuristic #1)
* **Rule:** The interface must communicate state transitions immediately (<100ms) upon user interaction.
* **Requirements:**
  * Background timers, counters, or async tasks must show live visible indicators (e.g. running timer pill, progress bar, loading spinner).
  * Optimistic UI updates should reflect action immediately while saving to state/store.
  * Successful deletions or completions should show a brief confirmation or toast notification.
* **Reference:** [Nielsen Norman Group — Visibility of System Status](https://www.nngroup.com/articles/visibility-system-status/)

### Pillar 2: User Freedom & Escape Hatches (NN/g Heuristic #3)
* **Rule:** Users must never feel trapped, blocked, or unable to cancel an ongoing action.
* **Requirements:**
  * Active focus sessions must provide an obvious "Stop Session" or "Cancel" button.
  * Modals must close via `Esc` key, an explicit `×` button, and clicking outside (backdrop click).
  * Forms and edits must provide a "Cancel" option to discard draft changes cleanly.
* **Reference:** [Nielsen Norman Group — Emergency Exits](https://www.nngroup.com/articles/emergency-exits/)

### Pillar 3: Elimination of Double Work & Automation (NN/g Heuristic #7)
* **Rule:** Never require the user to perform an action the system already has enough information to execute.
* **Requirements:**
  * When all checklist sub-items are completed, auto-complete the parent task.
  * When a counter task reaches its target count, automatically mark it done.
  * Default focus to the primary input when a modal opens (`autoFocus`).
* **Reference:** [Nielsen Norman Group — Efficiency of Use](https://www.nngroup.com/articles/flexibility-efficiency-heuristics/)

### Pillar 4: The 5 UI States Architecture
* **Rule:** Every component, list, and container must explicitly account for all 5 states:
  1. **Ideal State:** Data present, perfectly formatted.
  2. **Empty State:** Zero items exist. Must display an inviting message and a clear primary action button (e.g., "No tasks scheduled for today. + Plan a task").
  3. **Loading State:** Data fetching or initial render. Use animated skeleton placeholders matching component geometry (avoid jarring blank spaces or shifting layouts).
  4. **Partial State:** In-progress task (e.g., 3/5 sub-items done, timer at 12m/25m). Must display progress bars or ratio pills.
  5. **Error State:** Network failure or validation issue. Display clear recovery instructions, not raw code errors.
* **Reference:** [Vince Speelman — The Nine States of Design](https://medium.com/swlh/the-nine-states-of-design-5b7bce09e752)

### Pillar 5: Accessibility & Interaction Ergonomics (WCAG 2.1 AA)
* **Rule:** All controls must be keyboard navigable and clearly legible.
* **Requirements:**
  * Keyboard navigation: All clickable elements must have visible `focus-visible:ring-2 focus-visible:ring-sage` styles.
  * Minimum touch/click target: Interactive buttons must be at least 32×32px (ideally 40×40px+ on mobile).
  * Contrast: Text must meet minimum 4.5:1 contrast against surface backgrounds.
* **Reference:** [W3C WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 2. Taskify Design Token Integration

All UI polish in Taskify must adhere strictly to [plan/DESIGN_TOKENS.md](../../../plan/DESIGN_TOKENS.md):

* **Color Palette:**
  * Primary Brand / Sidebar: `bg-forest` (`#1F332D`), hover `bg-forest-dark` (`#091E19`)
  * Primary Actions / Focus Outlines: `bg-sage` (`#588176`), hover `bg-sage-dark` (`#3D665C`)
  * Canvas / Surfaces: App canvas is `bg-paper` (`#F8F9FA`), cards are `bg-paper-card` (`#FFFFFF`)
  * Borders / Dividers: Hairline dividers use `border-paper-dim` (`#E5E7EB`)
  * Text Colors: Body `text-slate-charcoal` (`#2B2D42`), subtext `text-slate-muted` (`#6C757D`)
* **Typography:**
  * Use the Inter font scale with strict tracking rules (e.g., display titles `-0.02em`, small labels `+0.04em` uppercase).
* **Motion & Transitions:**
  * Use Framer Motion (`framer-motion`) with snappy spring curves (`stiffness: 400, damping: 30`) or `duration-150 ease-out` for hover states.

---

## 3. The 4-Question Audit Checklist

Before concluding any UI work, walk through this checklist:

1. [ ] **Visibility:** Did the UI react instantly to user input? Are progress bars and timers updated?
2. [ ] **Escape Hatch:** Can the user cancel, close, or stop this flow without reloading?
3. [ ] **No Double Work:** Did we automate the next logical step (e.g., auto-complete, auto-focus)?
4. [ ] **Empty & Error States:** Does the screen look designed and intentional when there are 0 tasks or an error occurs?

---

## 4. References & Documentation

* Detailed learning guide and reading links: [references/resources.md](./references/resources.md)
* Taskify UX Fix Master Plan: [plan/UX_FIX_PLAN.md](../../../plan/UX_FIX_PLAN.md)
* Taskify Design Tokens: [plan/DESIGN_TOKENS.md](../../../plan/DESIGN_TOKENS.md)
