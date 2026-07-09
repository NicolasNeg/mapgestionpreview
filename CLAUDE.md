# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static landing site for **MapGestion** — yard/fleet control for rent-a-car companies ("arrendadoras"), sold as a llave-en-mano dedicated-instance product (software + a per-client database), not a shared SaaS. Deployed to `https://mapgestion.com` via GitHub Pages from the `main` branch root. No build step, no package manager, no CI pipeline.

## Development

Open any `.html` file directly in a browser — there is nothing to install or compile. To preview with a local server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Deployment is automatic: push to `main` and GitHub Pages publishes within seconds.

## Architecture

Two styling worlds coexist — do not assume Tailwind everywhere:

- **`index.html`** is an **immersive, animation-heavy landing** split across three sibling files at repo root: `index.html` + `styles.css` (custom CSS, mobile-first, CSS variables) + `app.js` (vanilla JS). It uses **GSAP + ScrollTrigger + MotionPathPlugin** (cdnjs) for scroll-driven animation — **no Tailwind**. Focus: rent-a-car yards ("arrendadoras"), pitched as a llave-en-mano dedicated-instance product (not a cheap SaaS, no pricing).
- **`terminos.html`** is a single-file page that **does** use Tailwind CDN.
- The sandbox pages use their own CSS-variable palettes and no Tailwind.

Shared: **Inter** + **Material Symbols Outlined** (Google Fonts). All dark (`--ink: #020617`), indigo/violet accents (`#818cf8`/`#c4b5fd`) plus functional map-status colors (green `#34d399` listo, amber `#fbbf24` preparación, red `#f87171` taller) and brand teal `#89f5e7`.

### Pages

| File | Purpose | Indexed |
|---|---|---|
| `index.html` (+ `styles.css`, `app.js`) | Main immersive landing | yes |
| `sandbox-demoOriginal.html` | Interactive yard simulator; **embedded in `index.html` via `<iframe>`** (supports `?embed=1` to hide its chrome) | no |
| `sandbox-mapa.html` | Older interactive map demo (legacy) | no |
| `terminos.html` | Terms + privacy (Tailwind) | — |
| `404.html` | GitHub Pages 404 (own blue theme) | — |

### `index.html` structure & animations (app.js)

Section IDs in order: `#hero` → `#operaciones` → `#plataforma` → `#transformacion` → `#sandbox-live` → `#modulos` → `#por-que` → `#implementacion` → `#contacto`.

Key GSAP behaviors (all params commented in `app.js`; tune `scrub`/`start`/`end`/`duration`):
- **Hero**: fade-up entrance on load; background `data-parallax` layer.
- **`#operaciones`**: a vehicle (`#car`) follows an SVG path (`#route`) via MotionPath on scroll; cards stagger; `#mapSim` markers drop into map spots (`.spot` at `left/top` %).
- **`#transformacion`**: pinned, scrubbed timeline — an Excel table empties → clean MapGestión cards → the map; caption swaps by progress. Mobile un-pins to stacked fade-ins.
- **`#plataforma`**: DOM parallax on `[data-parallax]` (× `BASE_PARALLAX`).
- Generic `.reveal` on-scroll + `[data-counter]` counters.

**Responsive/motion:** `gsap.matchMedia()` gates heavy effects to desktop and simplifies on mobile; everything is disabled under `prefers-reduced-motion`. **Progressive enhancement:** `<head>` adds a `js` class; `styles.css` only hides `.gsap-fade/.gsap-card/.reveal` when `.js` is present, and `app.js` (guarded by `HAS_GSAP`) removes `js` if GSAP fails to load — so content is never trapped behind JS. A `[data-counter]` fallback writes final values when animation is off.

### Interactivity (no backend)

No contact form and no pricing. CTAs go to WhatsApp (`wa.me/524778024682`) or `mailto:contacto@mapgestion.com`. The simulator is embedded, not opened in a new tab.

### SEO / structured data

`index.html` embeds four JSON-LD blocks in `<head>`: `SoftwareApplication`, `WebSite`, `Organization`, `FAQPage`. Pricing was removed — `SoftwareApplication.offers` is a single "Licencia Corporativa" with `price: "Custom"` (non-numeric on purpose; a validator may flag it). `FAQPage` is kept in `<head>` for SEO but **not** rendered on the page.

### Known placeholders

The social-proof strip uses placeholder wordmark "logos" and a `[Nombre]/[Cargo]/[Arrendadora]` testimonial — both marked `TODO` in `index.html`, awaiting real client assets.

### Assets

- `assets/brand/` — logos and OG image (SVG + PNG)
- `assets/screenshots/` — real product screenshots referenced inline in `index.html`
- `assets/videos/video_preview.mp4` — product demo video
- `CNAME` contains the custom domain (`mapgestion.com`)
- `.nojekyll` prevents GitHub Pages from running Jekyll
