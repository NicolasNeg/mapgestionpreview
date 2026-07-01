# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static landing site for **MapGestion** (fleet management / parking-map SaaS). Deployed to `https://mapgestion.com` via GitHub Pages from the `main` branch root. No build step, no package manager, no CI pipeline.

## Development

Open any `.html` file directly in a browser — there is nothing to install or compile. To preview with a local server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

Deployment is automatic: push to `main` and GitHub Pages publishes within seconds.

## Architecture

All pages are self-contained single-file HTML with inline `<style>` and `<script>` tags. External dependencies are loaded via CDN only:

- **Tailwind CSS** (`cdn.tailwindcss.com`) — utility classes plus a custom `tailwind.config` block at `index.html:186`
- **Inter** (Google Fonts) — sole typeface across all pages
- **Material Symbols Outlined** (Google Fonts CDN) — icon font used in `index.html`

### Pages

| File | Purpose | Indexed |
|---|---|---|
| `index.html` | Main marketing landing page | yes |
| `estacionamientos-mapa.html` | Segment landing for parking systems | no |
| `sandbox-mapa.html` | Interactive map demo (internal/demo use) | no |
| `terminos.html` | Terms of service | — |
| `404.html` | GitHub Pages 404 | — |

### Dark theme

`index.html` is **always dark** — `body` has `background: #070d1b` and `color: #dce5f5` hardcoded in `<style>`. A large CSS block (~line 1800+) unconditionally overrides all Tailwind surface/text color classes with dark values using `!important`. The `<html class="light">` and `tailwind.config darkMode: "class"` exist but there is no runtime toggle — they are vestigial from an earlier light-mode design. Do not rely on Tailwind `dark:` prefixes for new dark-mode styling; use the override block pattern instead.

The dark map pages (`sandbox-mapa.html`, `estacionamientos-mapa.html`) use a separate CSS-variable palette (`--bg: #111329`, `--panel`, `--slot`, etc.) in their own `<style>` blocks — they do **not** use Tailwind at all.

### Design tokens

Tailwind theme extension (colors, spacing, type scale) is defined at `index.html:186`. Notable aliases: `primary-container` = `#131b2e` (dark navy), `tertiary-fixed` = `#89f5e7` (teal accent). Border radii are overridden to be tighter than Tailwind defaults (`lg` = 0.25rem, `full` = 0.75rem).

### `index.html` section IDs

Nav links and `data-plan` CTAs use anchor scrolling. Sections in order:
`#servicios` → `#metricas` → `#antes-despues` → `#producto` → `#beneficios` → `#como-funciona` → `#demo` → `#pantallas` → `#clientes` → `#reviews` → `#faq` → `#precios` → `#contacto`

### Interactivity patterns

**Contact form** (`#contacto`): submits via `window.location.href = mailto:…` — no backend, no server. The `handleForm` function at the bottom `<script>` builds the mailto URL from `FormData`.

**Pricing → form wiring**: anchor tags in pricing cards carry `data-plan="Lite|Local|Regional|Corporativo"`. A `querySelectorAll('[data-plan]')` listener pre-fills the hidden `<input id="plan">` in the contact form when a pricing CTA is clicked.

**Animated counters**: elements with `[data-counter]` in the metrics strip (`#metricas`) animate from 0 to the target value on first scroll-into-view via `IntersectionObserver`. Attributes: `data-counter` (number), `data-prefix`, `data-suffix`.

**Screenshot lightbox**: `.gallery-frame[data-src]` buttons open a fullscreen overlay. Required attributes: `data-src`, `data-title`, `data-kicker`, `data-desc`. Keyboard: Arrow keys navigate, Escape closes.

**Sandbox modal**: `openSandbox()` lazy-loads `sandbox-mapa.html` via `fetch()` into `iframe.srcdoc`. The iframe approach is used to avoid a full-page navigation; if CSP blocks `srcdoc` in a given context, it falls back to a message with an "open in new tab" button.

### SEO / structured data

`index.html` embeds four JSON-LD blocks in `<head>`: `SoftwareApplication`, `WebSite`, `Organization`, `FAQPage`. The four plan prices in `SoftwareApplication.offers` must stay in sync with what's displayed in `#precios`. Current plans: Lite $990, Local $1,990, Regional $4,490, Corporativo $9,990 (all MXN).

### Assets

- `assets/brand/` — logos and OG image (SVG + PNG)
- `assets/screenshots/` — real product screenshots referenced inline in `index.html`
- `assets/videos/video_preview.mp4` — product demo video
- `CNAME` contains the custom domain (`mapgestion.com`)
- `.nojekyll` prevents GitHub Pages from running Jekyll
