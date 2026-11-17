# Taskify Web — Design Tokens Reference

All tokens are defined in `src/app/globals.css` under the Tailwind v4 `@theme` block and are usable as Tailwind utility classes (e.g. `bg-forest`, `text-sage`, `border-paper-dim`).

---

## Color Palette

### Brand / Forest & Sage

| Token | Tailwind Class | Hex | Usage |
| :--- | :--- | :--- | :--- |
| `--color-forest` | `bg-forest` / `text-forest` | `#1F332D` | Sidebar bg, dark modal accents, primary brand |
| `--color-forest-dark` | `bg-forest-dark` | `#091E19` | Hover states on forest bg elements |
| `--color-forest-light` | `bg-forest-light` | `#2C483F` | Lighter forest variant |
| `--color-sage` | `bg-sage` / `text-sage` | `#588176` | Primary buttons, active nav, focus outlines |
| `--color-sage-dark` | `bg-sage-dark` | `#3D665C` | Sage hover states |
| `--color-sage-badge` | `bg-sage-badge` | `#3A5A40` | Active day pill, countdown badges |
| `--color-sage-light` | `bg-sage-light` | `#EAF2EF` | P1 priority wash, tag backgrounds, subtle fills |

### Surface / Paper

| Token | Tailwind Class | Hex | Usage |
| :--- | :--- | :--- | :--- |
| `--color-paper` | `bg-paper` | `#F8F9FA` | App canvas background (warm off-white) |
| `--color-paper-card` | `bg-paper-card` | `#FFFFFF` | Task cards, modals, input fields |
| `--color-paper-dim` | `border-paper-dim` | `#E5E7EB` | Hairline borders, dividers, card outlines |

### Text

| Token | Tailwind Class | Hex | Usage |
| :--- | :--- | :--- | :--- |
| `--color-slate-charcoal` | `text-slate-charcoal` | `#2B2D42` | Primary body text, headings |
| `--color-slate-muted` | `text-slate-muted` | `#6C757D` | Metadata, timestamps, subtext, placeholders |

### Priority Accents

| Priority | Bg Token | Text Token | Border Token | Intent |
| :--- | :--- | :--- | :--- | :--- |
| **P0 Urgent** | `bg-priority-p0-bg` `#F9EBEB` | `text-priority-p0-text` `#C97A7A` | `border-priority-p0-border` `#F2C4C4` | Critical — max 1–2 per day |
| **P1 High** | `bg-priority-p1-bg` `#EAF2EF` | `text-priority-p1-text` `#588176` | `border-priority-p1-border` `#C0ECDE` | Deep work milestones |
| **P2 Normal** | `bg-priority-p2-bg` `#F4F1EA` | `text-priority-p2-text` `#A39B8B` | `border-priority-p2-border` `#E3DEC3` | Routine maintenance |
| **Staged** | `bg-priority-staged-bg` `#FBF0E4` | `text-priority-staged-text` `#D49B57` | `border-priority-staged-border` `#F0D5B8` | Waiting for external |

---

## Typography Scale (Inter Font)

Font loaded via `next/font/google` in `src/app/layout.tsx` and applied via the `--font-inter` CSS variable.

| Role | Size | Line Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | 32px | 40px | 600 | -0.02em | Page titles, capacity headers |
| `headline-lg` | 24px | 32px | 600 | -0.015em | Section headers, modal titles |
| `headline-md` | 18px | 26px | 600 | -0.01em | Sub-sections, column titles |
| `headline-sm` | 15px | 22px | 600 | -0.005em | Task card titles, day badges |
| `body-lg` | 15px | 24px | 400 | — | Descriptions, review prompts |
| `body-md` | 13px | 20px | 400 | — | Task metadata, placeholders |
| `body-sm` | 12px | 18px | 400 | — | Timestamps, secondary stats |
| `label-sm` | 11px | 14px | 600 | +0.04em | ALL-CAPS day markers, status chips |

---

## Elevation & Radii

| Token | Value | Usage |
| :--- | :--- | :--- |
| Base radius | `8px` (`rounded-lg`) | Task cards, buttons, inputs, tags |
| Large radius | `16px` (`rounded-xl`) | Flyouts, modals, large planner containers |
| Ambient shadow | `0 1px 3px rgba(31,51,45,0.04)` (`shadow-xs`) | Standard card float |
| Drag shadow | `0 8px 16px -4px rgba(31,51,45,0.12)` | Active drag state with 1° rotation |

---

## Tailwind Class Quick Reference

```tsx
// Primary action button
<button className="bg-forest hover:bg-forest-light text-white px-4 py-2 rounded-lg font-semibold text-sm" />

// Sage interactive button
<button className="bg-sage hover:bg-sage-dark text-white px-4 py-2 rounded-lg font-semibold text-sm" />

// Card surface
<div className="bg-white border border-paper-dim rounded-xl shadow-xs p-4" />

// Muted body text
<p className="text-sm text-slate-muted" />

// P0 priority badge
<span className="bg-priority-p0-bg text-priority-p0-text border border-priority-p0-border rounded px-2 py-0.5 text-xs font-bold font-mono" />

// Completed task
<span className="line-through text-slate-muted opacity-75" />
```
