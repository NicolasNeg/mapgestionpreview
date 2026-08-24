# Story scroll + full gallery — Design

**Date:** 2026-07-26  
**Status:** Approved in chat; awaiting file review  
**Scope:** Landing `#producto` story flow + `#plataforma` screenshot gallery + interactive table polish

## Goal

Make the product story a clear 4-scene scroll narrative, give each scene and each gallery slide enough dwell time, and make the interactive table read full-width without fuel bars or inner scrollbars.

## Non-goals

- No sandbox iframe return
- No pricing, forms, or backend changes
- No brand/theme overhaul beyond layout/timing of these sections

## Architecture (approach 2)

Two pinned scrub sequences on desktop:

1. **Pin A — `#transformacion`:** scenes 1–3 (chat → Excel → table)
2. **Pin B — `#anywhere`:** scene 4 (mockups patio → casa → viaje)
3. **Pin C — `#plataforma`:** full screenshot gallery (all assets)

Mobile (`max-width: 767px`): stacked blocks, no pin; captions/titles always visible. Respect `prefers-reduced-motion`.

## Story scenes

Remove the generic `story__intro` (“Hoy preguntas. Con MapGestión, miras.”). Titles live **inside** each scene as the primary caption (`chaos__cap` / scene title), large and readable.

| # | Title | Visual | Unit thread |
|---|--------|--------|-------------|
| 1 | Hoy preguntas | Radio/WhatsApp preview | Question about **D5256** |
| 2 | Revisas registros desactualizados | Messy Excel | Same units, uncertain cells |
| 3 | Con MapGestión solo miras | Interactive `mgtable` | Search prefilled **D5256** |
| 4 | Desde donde sea | Phone mockups | Patio → casa → viaje |

### Pin A timing (desktop)

- Scroll length ≈ **360–420%** of viewport (`end: +=380%` starting point; tune to ~120–140vh per scene including holds).
- Timeline: hold chat → crossfade to Excel → hold → crossfade to table → hold.
- Caption text swaps with scene (not a separate intro headline).

### Pin B timing (desktop)

- Convert `#anywhere` from a static 3-column rail into a pinned scrub: one mockup centered at a time, crossfade, ~**100–120vh per mockup**.
- Keep patio / casa / viaje copy with each slide.

## Interactive table polish

- Remove fuel progress bar (`.mg-fuel` / `.mg-fuel__bar`); render gasolina as plain text only (`F`, `1/4`, etc.). Sorting by fuel still works via existing numeric parse.
- Remove `.mgtable__scroll` max-height and overflow; table grows with rows — **no inner scrollbar**.
- Table stretches full width of the chaos stage / container; bump base font slightly (~0.95–1rem) so columns remain readable without horizontal scroll on desktop ≥1200px. On narrow widths, allow page-level horizontal overflow only if unavoidable; prefer slightly tighter padding over an inner scroll box.

## Full gallery (`#plataforma`)

Include **all** unique files under `assets/screenshots/` (dedupe path casing). Suggested narrative order (labels in Spanish):

1. mapa-vivo — Mapa del patio  
2. resumen-flota — Resumen  
3. gestion-flota — Flota  
4. editor-mapa — Editor  
5. plazas — Plazas  
6. ubicaciones — Ubicaciones  
7. estados — Estados  
8. categorias — Categorías  
9. modelos — Modelos  
10. gasolinas — Gasolinas  
11. cuadre — Cuadre  
12. bitacora-incidencias — Incidencias  
13. bitacora-gestion — Bitácora gestión  
14. historial-mapa — Historial mapa  
15. mensajes-internos — Mensajes  
16. roles-permisos — Roles  
17. usuarios — Usuarios  
18. aprobacion-accesos — Accesos  
19. empresa-admin — Empresa  
20. mi-perfil — Perfil  
21. auditoria-sistema — Auditoría  

Keep existing fullscreen step pattern: full-bleed image, scrim, copy bottom-right glass panel.  
`screenSteps()` already scales `end` by `steps.length * 100%` — raise to **~110–120% per step** for longer dwell (`steps.length * 120`).

## Files to touch

- `index.html` — story markup (titles, remove intro, anywhere structure, all gallery steps)
- `styles.css` — chaos captions/stage, anywhere pin layout, mgtable size/no scrollbar, fuel bar removal styles
- `app.js` — `xTransition` 3-scene titles/timing; new anywhere pin timeline; `screenSteps` duration; table cell render without fuel bar

## Success criteria

- Desktop: clear 4-scene story with readable titles and comfortable scroll holds.
- Table: no fuel bars, no inner scrollbar, full container width, D5256 still highlighted via search.
- Gallery: every screenshot appears once with scroll dwell; copy remains legible.
- Mobile + reduced-motion: content readable without being stuck behind opacity 0.

## Out of scope follow-ups

- Fine-tuning exact vh after browser preview (expected iteration).
- Replacing provisional video asset.
