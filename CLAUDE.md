# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static landing site for **MapGestión** — yard/fleet control for rent-a-car companies ("arrendadoras"), sold llave en mano (implementation + software in the cloud). **Do not claim a dedicated instance / own database per client, "< 5 días" or "100 % movimientos trazados"** (removed 2026-09-26: not verifiable). The `#confianza` stats are words, not numbers: "En la nube", "Desde el celular", "Por rol" + a line of live features. The real app lives at `https://app.mapgestion.com` (linked from the nav, mobile drawer and footer as "Iniciar sesión"). No build step, no package manager needed.

**Core message:** cloud + phone + anti-WhatsApp/radio. Interactive demo domain = futuro (copy "próximamente" only, once, in `#video-tour`).

## Hosting & deploy (how it really works)

- `mapgestion.com` DNS is on **Cloudflare (proxied)**; the origin is **GitHub Pages** (`CNAME` = `mapgestion.com`, `.nojekyll`). Cloudflare Pages is **not** serving the domain; `package.json` only holds no-op scripts left from a Cloudflare Pages attempt.
- Deploy: **push to `main`** → GitHub Actions "pages build and deployment" (~1 min) → Cloudflare edge.
- Caching: HTML ~10 min, static assets ~4 h. When `styles.css` / `app.js` change, bump the `?v=YYYYMMDD` query in `index.html` (and `assets/css/terminos.css?v=` in `terminos.html`). New images should get new filenames.
- Cloudflare injects its email-obfuscation script and rewrites visible emails; wrap visible addresses in `<!--email_off-->…<!--/email_off-->`. `http://` is not redirected to https yet (enable "Always Use HTTPS" in Cloudflare).

## Development

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Architecture

Two styling worlds coexist — do not assume Tailwind everywhere:

- **`index.html`** + `styles.css` (custom CSS, mobile-first, CSS variables) + `app.js` (vanilla JS + GSAP 3 ScrollTrigger from cdnjs, loaded with `defer`). **No Tailwind.**
- **`terminos.html`** uses Tailwind v3 **precompiled** to `assets/css/terminos.css` (no CDN). Regenerate after changing its classes:
  `npx tailwindcss@3 -i in.css -o assets/css/terminos.css --minify` with `content: ['terminos.html']` and `fontFamily.sans = ['Inter','sans-serif']` (in.css = the three `@tailwind` directives).
- **`404.html`** — standalone page, own styles; uses absolute links (`/`, `/terminos.html`) because it is served on any path.
- Legacy sandbox pages were **deleted** (commit a7460d6); nothing references them.

**Theme: light, matching the MapGestión app** (source of truth: app repo `ESTILO.md` + `css/shell.css`). `:root` holds the tokens as CSS variables and `color-scheme: light` (+ `<meta name="color-scheme" content="light">`); there is intentionally no OS dark-mode variant. Workspace sections: bg `#eef3f9` / white, white cards (border `#e2e8f0`, radius 12px, shadow `0 1px 3px rgba(0,0,0,.08)`), text slate `#1e293b`/`#0f172a`, muted `#475569` (not `#64748b` on `#eef3f9`: fails AA). Accent blue `#3b82f6`; buttons/links use `#2563eb` (AA with white). On dark (hero scrim, CTA, `#ia` chat) use `#93c5fd` for accent text. Hero and CTA use the login navy `#0b1020`; footer uses the app sidebar navy `#07111f`; `theme-color` is `#0b1020`. Status colors (map + table + legend, also `COLORS` in `app.js`): listo `#10b981`, preparación `#f59e0b`, en patio `#3b82f6`, taller `#ef4444`. No glassmorphism/teal glow, no gradients on text. Fonts: **Inter** 400/500/600/700 only (no Outfit, no 800/900) + **Material Symbols Outlined** loaded as a subset via `icon_names=` (alphabetical list). If you use a new icon, add its name to that list in `index.html` or it will not render. The brand SVG logo is white: on light surfaces (nav, drawer, 404, terminos) it is darkened with `filter: invert(1) hue-rotate(180deg) brightness(.3) saturate(1.6)`; don't edit the asset. `404.html` (inline CSS) and `terminos.html` (precompiled Tailwind `assets/css/terminos.css`) follow the same palette.

### `index.html` structure (section order)

`#hero` → `#producto` (pinned chat → Excel → tabla) + `#anywhere` → `#ia` (asistente IA, **Próximamente**) → `#video-tour` (captura del mapa + CTA "Pide una demo guiada") → `#plataforma` (pantallas) → `#modulos` (intro + módulos) → `#ademas` ("Y además", 8 tarjetas) → `#implementacion` → `#confianza` → `#faq` (visible; debe coincidir con el JSON-LD `FAQPage`) → `#contacto` → footer.

- **Nav:** light pill like the app header (`.nav`). The mobile drawer (`#navDrawer`) and overlay (`#navOverlay`) are **siblings of `.nav` at body level** on purpose: `.nav__pill` has `backdrop-filter`, which would become the containing block of a fixed child. Menu JS (`mobileMenu()` in `app.js`) does not depend on GSAP: closes on link tap, overlay, close button and Escape; keeps `aria-expanded` / `inert` in sync.
- **Hero:** `<picture>` with WebP crops (mobile 480/750, portrait-tablet full 1086, desktop 800/1086) + preloads per media query; PNG fallback. The h1 is split into 3 `.hero__line` spans; their entrance is a CSS `transform`-only keyframe (never `opacity:0`, which delayed LCP; the h1 is the LCP element). On scroll GSAP zooms `.hero__media` (scale 1→1.12) and lifts/fades `.hero__content` (scrubbed).
- **Modules:** Mapa (animated `.spot` units over the empty B-1…B-10 cajones; `--x/--y` were measured in pixels on `mapa-vivo.png` 1516×811, recalibrate if the screenshot changes), Cuadre, Notas/incidencias, Traslados (`historial-mapa-traslados.*`, recorte de `historial-mapa.png` sin la columna USUARIO con nombres reales). **QR, Papeletas y Alertas are commented out** with `<!-- TODO: reactivar con captura real -->` until real screenshots exist (`qr-unidad.png`, `papeletas.png`, `alertas.png` do not exist yet).
- **Video tour:** the custom player markup is commented out (TODO). The old `assets/videos/video_preview.mp4` was not the product tour (it was a third-party football clip) and was removed; a static `mapa-vivo` screenshot is shown instead. When the real 60–120 s tour exists, add it (~1280 px, ~1–3 MB, `+faststart`, poster) and restore the player; `mgVideoPlayer()` in `app.js` still supports it.
- **Asistente IA (`#ia`):** chat de ejemplo (CSS, sin imágenes) + 5 tarjetas. Está marcado **Próximamente** porque en producción la API aún no tiene `GEMINI_API_KEY` (el endpoint `POST /v1/assistant/mapa` ya está desplegado). Al activarse: quitar los badges `Próximamente` y `.ia__note`, y actualizar la respuesta de IA en `#faq` + JSON-LD. No mencionar IA en el hero mientras no esté activa.
- **Y además (`#ademas`):** solo funciones que ya funcionan en producción (ver "Respaldo de funciones").
- GSAP: `.reveal`, `.mod__text`, `.mod__media`, `.spot` start hidden only when `<html>` has the `js` class; `app.js` removes it if GSAP fails or reduced-motion is on (the page then shows final states, no pin/scrub).

### Animations (Apple-style, `app.js` + `styles.css`)

- Everything lives in one `gsap.matchMedia()` with conditions `motion` (`prefers-reduced-motion: no-preference`), `pinnable` (motion + `min-height: 600px`) and `stickyChat` (motion + `min-width: 1000px` + `min-height: 700px`). Resizing across a breakpoint reverts and rebuilds everything; `ScrollTrigger.config({ ignoreMobileResize: true })`.
- Style: fade + small rise, `expo.out` / `power3.out`, 0.8–1.2 s, small staggers. **No bounce/elastic, no px offsets:** distances are `%` or derived from the viewport (`rise()` = clamp(16, 4.5% of innerHeight, 44)). Scrubbed values use `yPercent`/`scale`.
- Order matters: the pinned `#producto` scene is created **before** every trigger below it (otherwise they fire ~3 screens early). Keep page order when adding triggers; `ScrollTrigger.sort()` runs at the end. Setup runs in short `setTimeout` chunks (one per block, via `ctx.add`) to keep TBT low. Don't add `opacity` tweens to text with small type (Lighthouse color-contrast measures mid-animation).
- `#producto` (chat → Excel → tabla) has two modes: **pinned** (`.chaos.is-pinned`, added by JS when `pinnable`): stage is a CSS grid with all layers in the same cell, so its height = tallest layer (no white gap), crossfade scrubbed over 2.4 × viewport height, heading text swapped from `CHAOS_SCENES` in `app.js`. **Flow** (no JS, reduced motion, short screens like 844×390 or 320×568): layers stacked with their own `.chaos__label` (h3 + p). The label texts duplicate `CHAOS_SCENES`: keep both in sync.
- `#ia`: on desktop (`stickyChat`) the chat is CSS `position: sticky` and the messages appear one by one scrubbed by the cards scrolling past; elsewhere they appear time-staggered when the chat enters.
- Other: word-by-word headline reveals (`splitWords()` wraps words in `.w`, skips `.sr-only`), batched card reveals (`ScrollTrigger.batch`), inner image parallax (`yPercent ±5` inside `overflow:hidden`), module screenshots scale/rise scrubbed, `#mgPlayer` scale-only zoom, map spots drop in with stagger. Map spot font uses a container query unit (`.map-sim` is `container-type: inline-size`; labels hidden below 560 px).
- Card hover lift uses the CSS **`translate`** property (not `transform`) so it never fights GSAP transforms.
- Checks after touching animations: no horizontal overflow at 320–2560, short heights (1366×650, 844×390), no-JS and reduced-motion show everything, CLS < 0.05, Lighthouse mobile a11y 100. Bump `?v=`.

### Interactivity (no backend)

Contact form posts to Formspree (`https://formspree.io/f/xgojgakq`) via fetch. CTAs also go to WhatsApp (`wa.me/524778024682`) or `mailto:contacto@mapgestion.com`.

### SEO / structured data

Meta + OG (`assets/brand/og-mapgestion.png` 1200×630) + Twitter `summary_large_image`, `og:locale es_MX`. JSON-LD: `SoftwareApplication` (no `offers`), `WebSite`, `Organization` (PNG logo `icon-512.png`), `FAQPage`. Brand is written **MapGestión** in visible text/meta (domain stays `mapgestion.com`). `robots.txt` + `sitemap.xml` (update `lastmod` when content changes).

### Assets

- `assets/brand/` — SVG logo/favicon + PNG icons (`favicon-32.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` 180) + OG image.
- `assets/scenes/` — lifestyle phone images: original PNGs (fallback only) + `*-420/720.webp` and hero crops `hero-index-{mobile-480,mobile-750,full-1086,desktop-800,desktop-1086}.webp`.
- `assets/screenshots/` — product UI PNGs + `*-640/1200.webp` for the ones used on the page. Several screenshots contain **real names / test data**; anonymize before publishing new ones.
- `assets/css/terminos.css` — precompiled Tailwind for `terminos.html`.

## Respaldo de funciones (no inventar)

Toda función o afirmación de la landing debe existir en el repo de la app (`NicolasNeg/MapGestion`, rama `main`) **y** funcionar en producción (la app corre sobre Supabase + API Nest desde el corte del 2026-09-18; varias colecciones legacy siguen en stub). Revisado el 2026-09-26:

- **Activo:** mapa operativo + mapa de calor (días en patio), editor de mapa con copias de seguridad, cuadre / cuadre de flota, unidades (alta/baja con km, importar Excel/CSV, exportar PDF), varias plazas, roles y permisos, invitaciones (alta con Google solo con invitación), login con Google / SMS / passkey (Face ID, huella), seguridad de cuenta (teléfono verificado, sesiones).
- **Código listo, falta activar en prod:** asistente IA del mapa (Gemini + voz es-MX; falta la key en la API).
- **Pendiente de migración a Supabase (no anunciar como nuevo):** historial de cambios, mensajes internos, alertas, turnos/checado facial, papeletas, QR, reporte de actividad desde captura (Gemini, solo formato Optima). Notas y Traslados siguen en la landing como estaban, pero sus tablas aún están en migración.
- **Solo planeado / abierto:** app nativa Android/iOS (PR #3), dominio demo.
