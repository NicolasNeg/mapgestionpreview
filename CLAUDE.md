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

- **Tailwind CSS** (`cdn.tailwindcss.com`) — utility classes plus a custom `tailwind.config` block defined in `index.html:178`
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

### Design tokens

`index.html` carries the Tailwind theme extension (colors, spacing, typography scale). The dark map pages (`sandbox-mapa.html`, `estacionamientos-mapa.html`) use a separate CSS-variable dark palette (`--bg: #111329`, `--panel`, `--slot`, etc.) defined in their own `<style>` blocks — they do **not** use Tailwind.

### SEO / structured data

`index.html` embeds four JSON-LD blocks (SoftwareApplication, WebSite, Organization, FAQPage) directly in `<head>`. Pricing in the SoftwareApplication schema must stay in sync with pricing shown in the page body.

### Assets

- `assets/brand/` — logos and OG image (SVG + PNG)
- `assets/screenshots/` — real product screenshots referenced inline in `index.html`
- `assets/videos/video_preview.mp4` — product demo video
- `CNAME` contains the custom domain (`mapgestion.com`)

## Product backlog context

The live application lives at `app.mapgestion.com` in a separate repo. The README contains a prioritized backlog (P0–P2) of tasks for that app — not for this landing site.
