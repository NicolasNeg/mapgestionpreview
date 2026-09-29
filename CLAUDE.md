# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static landing site for **MapGestión** — yard/fleet control for rent-a-car companies ("arrendadoras"), sold llave en mano (implementation + software in the cloud), plus the upcoming **Clientes y verificación 110** platform (plan "MapGestion Customer & Risk Platform v1.0"). **Do not claim a dedicated instance / own database per client, "< 5 días" or "100 % movimientos trazados"** (removed 2026-09-26: not verifiable). The real app lives at `https://app.mapgestion.com` (linked **only** as a small underlined "Iniciar sesión" link at the very bottom of the footer, `.foot__login` in `.foot__copy`; it was removed from the nav and the mobile drawer on purpose, the header keeps only "Solicitar demo"). No build step, no package manager needed.

**Core message:** "Del patio al mostrador. Todo desde el celular." Today: the yard map, cuadre and fleet in the cloud, without WhatsApp/radio. In development: clientes frecuentes + verificación 110 in a network between arrendadoras.

### Honesty rules (landing v3 → v4, 2026-09-29)

- Live features (see "Respaldo de funciones") carry **no badge**. The AI assistant is **"Próximamente"** (`.soon`). Everything of Clientes / restricciones / verificación 110 / red entre arrendadoras / API Partner is **"En desarrollo"** (`.soon.soon--dev`, `.soon--dark` on navy). Never present them as available; the hero says "En desarrollo: …" explicitly.
- Never write "lista negra" except to deny it ("No una lista negra"). Say "expediente 110 verificado", with evidence, second reviewer, rectification/dispute and audit log. The network activates only after legal review, partner contracts and privacy notice (`.net__note`).
- Match results are explained per field (Exacto / Coincide / Similar / No disponible), **no percentages and no AI risk score**. A provider that doesn't answer = "No se pudo verificar", never adverse. The decision to rent is always the rental company's (`decision: null` in the API snippet).
- The AI "propone, no decide": it reads, searches, summarizes and prepares drafts; it cannot activate/delete a 110 or change a restriction.
- Sample data in mocks is fictional and must look fictional: surnames Ejemplo / Prueba / Muestra, folios `MG-110-2026-…`, masked licences `••••••4827`, footer "Pantalla ilustrativa: nombres, datos y folios ficticios."
- Traslados, Historial de cambios and Cuadre de flota are **not** shown as live (empty or dev errors in prod); the screenshots crop the sidebar, which is where those labels appear. Heat map is only mentioned as a menu option ("Vista y filtros").
- **Technical 110/API detail lives only in `resumen-extendido.html`** (POST /v1/verifications snippet, the 6 network rules, flow diagram, privacy/retention, technical FAQ). The home keeps `#verificacion` and `#red` short and non-technical, with a "Conoce más en el Resumen extendido" link. Do not put the API snippet or the 6 rules back on the home.
- Retention: never state "72 meses" (or any number) as fact for 110; the plan says the retention policy per data category must be validated legally first. Say "conservación limitada por tipo de dato".

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

**Theme: light, matching the MapGestión app** (source of truth: app repo `ESTILO.md` + `css/shell.css`). `:root` holds the tokens as CSS variables and `color-scheme: light` (+ `<meta name="color-scheme" content="light">`); there is intentionally no OS dark-mode variant. Workspace sections: bg `#eef3f9` / white, white cards (border `#e2e8f0`, radius 12px, shadow `0 1px 3px rgba(0,0,0,.08)`), text slate `#1e293b`/`#0f172a`, muted `#475569` (not `#64748b` on `#eef3f9`: fails AA). Accent blue `#3b82f6`; buttons/links use `#2563eb` (AA with white). On dark (hero scrim, CTA, `#ia` chat) use `#93c5fd` for accent text. Hero and CTA use the login navy `#0b1020`; footer uses the app sidebar navy `#07111f`; `theme-color` is `#0b1020`. Status colors (map + table + legend, also `COLORS` in `app.js`): listo `#10b981`, preparación `#f59e0b`, en patio `#3b82f6`, taller `#ef4444`. No glassmorphism/teal glow, no gradients on text. Fonts: **Inter** 400/500/600/700 only (no Outfit, no 800/900) + **Material Symbols Outlined** loaded as a subset via `icon_names=` (alphabetical list). If you use a new icon, add its name to that list in **both** `index.html` and `resumen-extendido.html` (same `<link>`) or it will not render. Icons in use: arrow_downward arrow_forward arrow_upward badge chat chevron_left chevron_right close directions_car document_scanner fact_check fingerprint forum gavel history hub info lightbulb local_fire_department location_city lock mail map menu menu_book receipt_long search send shield smart_toy unfold_more verified_user volume_up. The brand SVG logo is white: on light surfaces (nav, drawer, 404, terminos) it is darkened with `filter: invert(1) hue-rotate(180deg) brightness(.3) saturate(1.6)`; don't edit the asset. `404.html` (inline CSS) and `terminos.html` (precompiled Tailwind `assets/css/terminos.css`) follow the same palette.

### `index.html` structure (section order)

`#hero` → `<main>`: `#producto` (pinned chat → Excel → tabla) → `#operacion` (map-sim + rail of **real app screenshots** + `#anywhere` scenes + `.specs`) → `#ia` (usos rápidos, Próximamente) → `#verificacion` (Clientes y verificación 110 mock, En desarrollo) → `#red` (navy: red entre arrendadoras + API snippet + reglas, En desarrollo) → `#seguridad` (hoy vs. en desarrollo) → `#implementacion` → `#faq` → `#contacto` → footer → `.mbar` (mobile sticky CTA).

- **Nav:** light pill like the app header (`.nav`); links Patio / IA / Verificación 110 / Seguridad / Resumen extendido + "Solicitar demo" (no "Iniciar sesión"). The mobile drawer (`#navDrawer`) and overlay (`#navOverlay`) are **siblings of `.nav` at body level** on purpose: `.nav__pill` has `backdrop-filter`, which would become the containing block of a fixed child. Menu JS (`mobileMenu()`) does not depend on GSAP.
- **Hero:** `<picture>` with WebP crops + preloads per media query; the h1 ("Del patio al mostrador. / Todo desde el celular.") is two `.hero__line` spans with a CSS `transform`-only entrance (never `opacity:0`: the h1 is the LCP element). `.hero__next` = the "En desarrollo" line.
- **Rail component** (`.rail[data-rail]` > `.rail__nav` chips `[data-go]` + `.rail__arrow[data-dir]` + `.rail__track` with scroll-snap). Used for the screenshots, the IA steps (`#quRail`), the 110 result states (`.vfapp__result`), the phone shots (`.rail--phones`). `rails()` in `app.js` (no GSAP) adds `.rail--ready` (chips/arrows are hidden without JS), syncs `aria-current` / `.is-active`, and exposes `rail.railGo(i)`. Tracks have `tabindex="0"` (axe scrollable-region-focusable). `.guard` (now only in the resumen page, `.guard--rx`) becomes a CSS-only swipe list below 700px.
- **Screenshots (v4, captured 2026-09-29 from app.mapgestion.com):** `assets/screenshots/<name>-<w>.{avif,webp}` + `<name>-<w>.jpg` fallback (`<picture>`, AVIF → WebP → JPG, explicit `width`/`height`, `loading="lazy"`). Desktop names: dashboard, mapa, mapa-unidad, mapa-filtros, sin-cajon, cuadre, unidades, editor, roles, modelos, plazas (768×525 and a 512 variant; editor 1024×525); phone names `m-dashboard`, `m-mapa`, `m-cuadre`, `m-unidades` (390×844). **Anonymization process:** crop the whole sidebar (x < 256: client brand, "Programador", user avatar/name, Traslados/Historial labels), blur the client name in the dashboard breadcrumb, plates (mapa-unidad, cuadre, unidades, sin-cajon and phone cuadre) and VINs (unidades, phone unidades); keep internal MVA numbers. Then OCR the outputs (tesseract) for "Optima", "ANGEL", "ARMENTA", plate and VIN patterns and look at every image. The originals and the build scripts are NOT in this repo. Shown inside a CSS browser frame (`.shot__bar`) or phone frame (`.phone__frame`). Never publish a raw capture; there are no unused screenshot files (keep it that way: `git rm` old ones).
- **`#ia` usos rápidos:** 5 `li.qu__step` (prompt + `.aicard` answer). Mobile/tablet: swipe carousel. Desktop ≥1000×700 with motion: **story mode** (`.qu.is-story`): `iaStory()` builds a sticky dark panel (`.qu__stage`, aria-hidden clones of the answers) and swaps the active answer while the prompts scroll by. The assistant spec: map only, reads mapa + cuadre of the active plaza, acts with the user's role, history is written under the user, fixed denial "NO TENGO PERMITIDO HACER ESO". When the Gemini key is active in prod: remove "Próximamente" from steps 1–3 and update the FAQ.
- **`#verificacion`:** `.flow` (4 steps) + `.vfapp` mock (capture / `#vfChecks` / result states rail) + `.vf__decide`. The old `.vfcards` (cliente frecuente, restricciones, historial) were removed from the home in v4 (that detail is explained in the resumen). `vfSequence()` shows each check as "Consultando…" then its final state and moves the result rail to "Expediente"; without JS the final state is static.
- **FAQ + JSON-LD:** the visible `#faq` and the `FAQPage` JSON-LD must say the same thing (generated together from one list; keep them in sync by hand). `resumen-extendido.html` has its own technical FAQ + `FAQPage`. `SoftwareApplication.featureList` lists **only live features**.
- **FAQ accordion (v4):** markup `details.faq__item[data-cat] > summary(.faq__q + .faq__icon) + .faq__a > .faq__aIn`. Works with no JS (native `<details>`; chips hidden). `faq()` in `app.js` (no GSAP) intercepts the summary click and animates the panel height with the Web Animations API (420 ms, `cubic-bezier(.16,1,.3,1)`), morphs the +/− icon and the accent bar in CSS, filters by `data-cat` with the chips (`aria-pressed`), and reveals items with a staggered `.is-in` on scroll. `prefers-reduced-motion`: no animation at all (opens instantly). Keyboard: Enter/Space on the summary. Answers may end with a `.more` link to a `resumen-extendido.html#…` anchor.
- **Mobile sticky bar (`.mbar`):** "Solicitar demo" + WhatsApp, shown by IntersectionObserver after the hero and hidden while `#contacto` / footer are visible (<1000px only).
- GSAP: items are hidden only by JS (`gsap.set` in `reveals()`), never by CSS, so no-JS / reduced-motion / failed CDN show everything.

### Animations (Apple-style, `app.js` + `styles.css`)

- Everything lives in one `gsap.matchMedia()` with conditions `motion` (`prefers-reduced-motion: no-preference`), `pinnable` (motion + `min-height: 600px`) and `stickyChat` (motion + `min-width: 1000px` + `min-height: 700px`). Resizing across a breakpoint reverts and rebuilds everything; `ScrollTrigger.config({ ignoreMobileResize: true })`.
- Style: fade + small rise, `expo.out` / `power3.out`, 0.8–1.2 s, small staggers. **No bounce/elastic, no px offsets:** distances are `%` or derived from the viewport (`rise()` = clamp(16, 4.5% of innerHeight, 44)). Scrubbed values use `yPercent`/`scale`.
- Order matters: the pinned `#producto` scene is created **before** every trigger below it (otherwise they fire ~3 screens early). Keep page order when adding triggers; `ScrollTrigger.sort()` runs at the end. Setup runs in short `setTimeout` chunks (one per block, via `ctx.add`) to keep TBT low. Don't add `opacity` tweens to text with small type (Lighthouse color-contrast measures mid-animation).
- `#producto` (chat → Excel → tabla) has two modes: **pinned** (`.chaos.is-pinned`, added by JS when `pinnable`): stage is a CSS grid with all layers in the same cell, so its height = tallest layer (no white gap), crossfade scrubbed over 2.4 × viewport height, heading text swapped from `CHAOS_SCENES` in `app.js`. **Flow** (no JS, reduced motion, short screens like 844×390 or 320×568): layers stacked with their own `.chaos__label` (h3 + p). The label texts duplicate `CHAOS_SCENES`: keep both in sync.
- `#ia`: story mode only under `stickyChat` (see above); otherwise the steps are a carousel with batch reveals.
- Other: word-by-word headline reveals (`splitWords()` wraps words in `.w`, skips `.sr-only`), batched card reveals (`ScrollTrigger.batch`, selector `REVEAL_SEL`), inner image parallax on `.scene__media img`, `productShots()` scale/rise scrubbed for `#mapSim`, `#vfApp` and the screenshot rail, map spots drop in with stagger, `#red` network lines pulse with CSS (off with reduced motion). Map spot font uses a container query unit (`.map-sim` is `container-type: inline-size`; labels hidden below 560 px).
- **Pin space reserve:** `styles.css` gives `.js .chaos:not(.is-pinned)` `padding-bottom: 240vh` under the same media query as `pinnable`, until `chaosPinned()` adds `.is-pinned` and the pin-spacer takes over. Without it, the first layout puts the screenshots within Chrome's lazy-load margin and they download while the h1 font is loading (mobile LCP 4.3 s → 3.5 s with the reserve). Motion setup and the rails' first measurement start after the first frame (`requestAnimationFrame` + `setTimeout`) for the same reason (TBT).
- Card hover lift uses the CSS **`translate`** property (not `transform`) so it never fights GSAP transforms.
- Checks after touching animations: no horizontal overflow at 320–2560, short heights (1366×650, 844×390), no-JS and reduced-motion show everything, CLS < 0.05, Lighthouse mobile a11y 100. Bump `?v=` (currently `?v=20260929a` in `index.html` and `resumen-extendido.html`).

### Interactivity (no backend)

Contact form posts to Formspree (`https://formspree.io/f/xgojgakq`) via `fetch` (FormData, `Accept: application/json`); fields nombre*, empresa, whatsapp*, email*, interes (select), mensaje + hidden `_subject` "Nuevo lead — MapGestión". Success/error text goes to `#cformStatus` (`aria-live=polite`); `contactForm()` refuses to send if the action still contains `YOUR_FORM_ID`. **Nothing else receives the submissions** (no backend, no email fallback): if the Formspree form is deleted/unconfirmed, leads are lost silently on the server side (the page would still show success only when Formspree answers 2xx). Verify in the Formspree dashboard that the form exists and its notification email is confirmed. CTAs also go to WhatsApp (`wa.me/524778024682`) or `mailto:contacto@mapgestion.com`.

### SEO / structured data

Meta + OG (`assets/brand/og-mapgestion.png` 1200×630; `resumen-extendido.html` reuses the same image with `og:type=article`) + Twitter `summary_large_image`, `og:locale es_MX`. JSON-LD: `SoftwareApplication` (no `offers`), `WebSite`, `Organization` (PNG logo `icon-512.png`), `FAQPage`. Brand is written **MapGestión** in visible text/meta (domain stays `mapgestion.com`). `robots.txt` + `sitemap.xml` (update `lastmod` when content changes).

### Assets

- `assets/brand/` — SVG logo/favicon + PNG icons (`favicon-32.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` 180) + OG image.
- `assets/scenes/` — lifestyle phone images: original PNGs (fallback only) + `*-420/720.webp` and hero crops `hero-index-{mobile-480,mobile-750,full-1086,desktop-800,desktop-1086}.webp`.
- `assets/screenshots/` — only the anonymized v4 UI captures (see "Screenshots" above). Any new capture has **real names / test data** until anonymized.
- `assets/css/terminos.css` — precompiled Tailwind for `terminos.html`.

## Respaldo de funciones (no inventar)

Toda función o afirmación de la landing debe existir en el repo de la app (`NicolasNeg/MapGestion`, rama `main`) **y** funcionar en producción (la app corre sobre Supabase + API Nest desde el corte del 2026-09-18; varias colecciones legacy siguen en stub). Revisado el 2026-09-26:

- **Activo:** mapa operativo (ficha de unidad, estadísticas de la plaza, unidades sin cajón, búsqueda global) + mapa de calor (días en patio), editor de mapa con copias de seguridad, cuadre, unidades (alta/baja con km, importar Excel/CSV, exportar, estampas QR), varias plazas, roles y permisos, invitaciones (alta con Google solo con invitación), login con Google / SMS / passkey (Face ID, huella), seguridad de cuenta (teléfono verificado, sesiones).
- **Código listo, falta activar en prod:** asistente IA del mapa (Gemini + voz es-MX; falta la key en la API).
- **Pendiente de migración a Supabase (no anunciar como nuevo):** historial de cambios, mensajes internos, alertas, turnos/checado facial, papeletas, QR, reporte de actividad desde captura (Gemini, solo formato Optima). Notas y Traslados: tablas en migración (Traslados/Historial vacíos en prod), ya **no** se muestran en la landing. Cuadre de flota muestra errores de desarrollo: no usar capturas.
- **En desarrollo (plan Customer & Risk Platform v1.0):** clientes (segmentos, tarifas OPT1…, preferencias, quejas), restricciones internas (Requiere revisión / autorización / depósito especial / No rentar), expedientes 110 con evidencia y doble revisión, verificación en mostrador, agente de verificación IA, API Partner (OAuth, `POST /v1/verifications`, sin búsquedas masivas) y red compartida de 110. Fases: MVP sin IA → V2 OCR/agente → V3 API/red. No hay código en la app todavía.
- **Solo planeado / abierto:** app nativa Android/iOS (PR #3), dominio demo.
