# Story Scroll + Full Gallery Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** 4-scene pinned story (chat→Excel→table→mockups), full screenshot gallery, wider table without fuel bars.

**Architecture:** Pin A (`#transformacion`) for scenes 1–3; Pin B (`#anywhere`) for mockups; Pin C (`#plataforma`) for all screenshots. Mobile stacks without pin.

**Tech Stack:** Vanilla HTML/CSS/JS + GSAP ScrollTrigger (CDN).

## Global Constraints

- Preserve existing dark teal brand; no purple theme change
- Progressive enhancement: content visible if GSAP fails / reduced motion
- No commits unless user requests
- Unit thread: D5256

---

### Task 1: Story markup + full gallery HTML

**Files:**
- Modify: `index.html` (`#producto`, `#plataforma`)

- [x] Remove `story__intro`
- [x] Scene titles via `chaos__cap` / anywhere title
- [x] Anywhere: pin stage with stacked cards for scrub
- [x] Gallery: all 21 screenshots with copy

### Task 2: CSS — stage, table, anywhere pin

**Files:**
- Modify: `styles.css`

- [x] Larger chaos titles; wider stage for table
- [x] mgtable full width, no max-height scroll, no fuel bar styles
- [x] Anywhere desktop pin layout (absolute cards)

### Task 3: GSAP timelines + table render

**Files:**
- Modify: `app.js`

- [x] `xTransition` longer holds + new titles
- [x] `anywhereScenes` pin scrub
- [x] `screenSteps` ~120% per step
- [x] Fuel cell = text only

### Task 4: Verify

- [x] Grep for leftover fuel bar / story intro
- Manual: open in browser and scroll desktop
