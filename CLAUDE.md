# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static landing site for **MapGestión** — yard/fleet control for rent-a-car companies ("arrendadoras"), sold as a llave-en-mano dedicated-instance product (software + a per-client database), not a shared SaaS. Deployed to `https://mapgestion.com` via GitHub Pages from the `main` branch root. No build step, no package manager, no CI pipeline.

**Core message (2026 redesign):** cloud + phone + anti-WhatsApp/radio. Sandbox interactivo en-page was replaced by a **video tour**. Interactive demo domain = futuro (copy “próximamente” only).

## Development

Open any `.html` file directly in a browser — there is nothing to install or compile. To preview with a local server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Deployment is automatic: push to `main` and GitHub Pages publishes within seconds.

## Architecture

Two styling worlds coexist — do not assume Tailwind everywhere:

- **`index.html`** is the marketing landing split across three sibling files at repo root: `index.html` + `styles.css` (custom CSS, mobile-first, CSS variables) + `app.js` (vanilla JS + GSAP ScrollTrigger). **No Tailwind**. Focus: cloud access from phone, yard map at a glance, suite modules, video tour.
- **`terminos.html`** is a single-file page that **does** use Tailwind CDN.
- Legacy sandbox pages (`sandbox-demoOriginal.html`, `sandbox-mapa.html`) remain in the repo but are **not linked** from the landing.

Shared: **Inter** + **Material Symbols Outlined** (Google Fonts). Dark ink `#041016`, accents teal/cian (`#2ec4b6` / `#89f5e7` / `#38bdf8`) plus functional map-status colors (green `#34d399` listo, amber `#fbbf24` preparación, red `#f87171` taller). Glass nav flotante.

### Pages

| File | Purpose | Indexed |
|---|---|---|
| `index.html` (+ `styles.css`, `app.js`) | Main landing (nube / celular / video) | yes |
| `sandbox-demoOriginal.html` | Legacy yard simulator (unlinked; future demo domain) | no |
| `sandbox-mapa.html` | Older interactive map demo (legacy) | no |
| `terminos.html` | Terms + privacy (Tailwind) | — |
| `404.html` | GitHub Pages 404 (own blue theme) | — |

### `index.html` structure (section order)

`#hero` → `#producto` (problema antes/ahora) → `#anywhere` → `#video-tour` → `#modulos` (7 bloques) → `#implementacion` → `#confianza` → `#contacto`.

Key GSAP behaviors (params in `app.js`):
- **Hero**: fade-up entrance; light `data-parallax` on background layer (desktop).
- Generic `.reveal` + section title fades on scroll.
- Form field stagger on `#contacto`.
- Heavy MotionPath / pinned showcase / embedded sandbox animations **removed**.

**Responsive/motion:** `gsap.matchMedia()` gates parallax to desktop; everything is disabled under `prefers-reduced-motion`. **Progressive enhancement:** `<head>` adds a `js` class; `styles.css` only hides `.gsap-fade/.reveal` when `.js` is present, and `app.js` removes `js` if GSAP fails or reduce-motion is on.

### Interactivity (no backend)

Contact form posts to Formspree. CTAs also go to WhatsApp (`wa.me/524778024682`) or `mailto:contacto@mapgestion.com`. Video uses native `<video controls>` (no autoplay with sound). Demo domain is announced as próximamente only.

### SEO / structured data

`index.html` embeds four JSON-LD blocks: `SoftwareApplication`, `WebSite`, `Organization`, `FAQPage`. `SoftwareApplication.offers` is "Licencia Corporativa" with `price: "Custom"`. FAQ emphasizes cloud/phone/anti-WhatsApp.

### Assets

- `assets/brand/` — logos and OG image (SVG + PNG)
- `assets/screenshots/` — product UI (mapa, cuadre, incidencias; more modules pending)
- `assets/scenes/` — **pending** lifestyle photos (hero phone, patio, casa, viaje)
- `assets/videos/video_preview.mp4` — product tour (replace with full ~60–120s master + captions when ready)
- `CNAME` — `mapgestion.com`
- `.nojekyll` — disables Jekyll on GitHub Pages
