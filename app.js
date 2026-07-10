/* ============================================================
   MapGestión — prototipo inmersivo · app.js
   GSAP + ScrollTrigger + MotionPathPlugin

   CÓMO AJUSTAR (lee estos comentarios):
   • scrub:  true = la animación sigue el scroll 1:1. Un número (p.ej. 1)
             añade "inercia" (segundos de suavizado). Súbelo para más lag.
   • start / end:  gatillos del scroll. Formato "posDelElemento posDelViewport".
             Ej. "top 80%" = cuando el top del elemento llega al 80% del viewport.
   • duration / stagger / ease:  velocidad y cascada de las entradas.
   • BASE_PARALLAX (abajo):  intensidad global del parallax en px.
   ============================================================ */

/* Progressive enhancement: si GSAP no cargó (CDN caído), revela el contenido. */
const HAS_GSAP = typeof gsap !== 'undefined';
if (!HAS_GSAP) document.documentElement.classList.remove('js');
if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

document.getElementById('year').textContent = new Date().getFullYear();

/* Intensidad base del parallax: cada data-parallax se multiplica por esto (px). */
const BASE_PARALLAX = 260;

/* ---- Entrada del Hero al cargar (fade-up). Ajusta duration/stagger/ease. ---- */
function heroIntro() {
  // fromTo = estado inicial explícito -> final (evita conflictos con el CSS opacity:0)
  gsap.fromTo('.gsap-fade',
    { opacity: 0, y: 20 },
    {
      opacity: 1, y: 0,
      duration: 0.7,      // ← velocidad de cada elemento
      ease: 'power3.out',
      stagger: 0.07,      // ← separación entre líneas (más ágil)
      delay: 0.1,
    });
}

/* ---- Cards escalonadas (stagger) al entrar en viewport ---- */
/* ---- Recorrido vertical: el auto baja y la línea se llena según el scroll.
   Las tarjetas (.reveal) aparecen a los lados al pasar. Ajusta start/end. ---- */
function journey() {
  const j = document.getElementById('journey'); if (!j) return;
  const fill = document.getElementById('jFill');
  const car = document.getElementById('car');
  // Transform + scrub con suavizado => baja fluido (sin saltos por setear top/height)
  const st = { trigger: j, start: 'top 60%', end: 'bottom 75%', scrub: 1, invalidateOnRefresh: true };
  gsap.fromTo(fill, { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top', ease: 'none', scrollTrigger: st });
  gsap.fromTo(car, { y: 0 }, { y: () => j.offsetHeight, ease: 'none', scrollTrigger: st });
}

/* ---- Marcadores que se ACOMODAN en los spots del mapa (entrada con rebote) ---- */
function mapSimAnimation() {
  gsap.from('#mapSim .spot', {
    opacity: 0, scale: 0.3, y: -26,
    duration: 0.5,
    ease: 'back.out(1.5)',            // ← el rebote da el efecto de "encajar" en el spot
    stagger: { each: 0.05, from: 'random' }, // ← se colocan uno a uno, en orden aleatorio
    scrollTrigger: {
      trigger: '#mapSim',
      start: 'top 75%',               // ← gatillo: dispara al entrar el mapa
    },
  });
}

/* ---- Parallax de profundidad en elementos [data-parallax] (hero bg) ---- */
function parallaxLayers() {
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || 0; // + baja, − sube
    gsap.fromTo(el, { y: -speed * BASE_PARALLAX }, {
      y: speed * BASE_PARALLAX,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section, header') || el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,      // ← movimiento ligado al scroll
      },
    });
  });
}

/* ---- Roadmap: scrollytelling pineado; cada paso sube y se desvanece ---- */
function roadSteps() {
  const steps = gsap.utils.toArray('#implementacion .road__step');
  if (steps.length < 2) return;
  gsap.set(steps, { opacity: (i) => (i === 0 ? 1 : 0), yPercent: (i) => (i === 0 ? 0 : 8) });
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#implementacion', start: 'top top',
      end: '+=' + steps.length * 100 + '%', // longitud de scroll de la secuencia
      scrub: 1, pin: '.road__pin', anticipatePin: 1, invalidateOnRefresh: true,
    },
  });
  steps.forEach((s, i) => {
    if (i === steps.length - 1) return;
    // el paso actual sube y desaparece; el siguiente ocupa su lugar (crossfade + slide)
    tl.to(s, { yPercent: -14, opacity: 0, ease: 'power1.inOut' }, i)
      .to(steps[i + 1], { yPercent: 0, opacity: 1, ease: 'power1.inOut' }, i);
  });
}

/* ---- "La plataforma en acción": scroll horizontal pineado (desktop) ---- */
function horizontalShowcase() {
  const track = document.getElementById('showcaseTrack');
  if (!track) return;
  gsap.to(track, {
    x: () => -(track.scrollWidth - window.innerWidth), // traslada hasta ver el último panel
    ease: 'none',
    scrollTrigger: {
      trigger: '#plataforma',
      start: 'top top',
      end: () => '+=' + track.scrollWidth, // longitud de scroll = ancho del track
      scrub: 1,
      pin: '.showcase__pin',
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: 1, // ← se calcula ANTES que los triggers de abajo (fix animaciones tras el pin)
    },
  });
}

/* ============================================================
   Responsive con gsap.matchMedia:
   - Animaciones solo si el usuario NO pidió reduce-motion.
   - PC (≥768px): parallax + ruta con MotionPath.
   - Móvil (<768px): fade-ins ligeros.
   ============================================================ */
/* ---- Entrada de los títulos/subtítulos de sección ---- */
function headings() {
  gsap.utils.toArray('.section-title, .section-sub').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 26, duration: 0.7, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });
}

/* ---- Reveal genérico (.reveal) para las secciones de contenido ---- */
function revealAll() {
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 16 }, {
      opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
}

/* ---- Contadores animados (0 -> target) al entrar ---- */
function counters() {
  gsap.utils.toArray('[data-counter]').forEach((el) => {
    const target = +el.dataset.counter, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const o = { v: 0 };
    // Loop continuo: cuenta 0→target, espera y repite MIENTRAS esté en pantalla.
    const tween = gsap.fromTo(o, { v: 0 }, {
      v: target, duration: 1.6, ease: 'power1.out',
      repeat: -1, repeatDelay: 2.4, paused: true,   // ← sube repeatDelay para pausas más largas
      onUpdate: () => { el.textContent = pre + Math.round(o.v) + suf; },
    });
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', end: 'bottom 10%',
      onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
    });
  });
}

/* ---- Transición "Del caos del Excel al mapa": el Excel se desvanece y la
   tabla entra desde abajo al hacer scroll ---- */
function xTransition() {
  const xls = document.querySelector('#transformacion .xls');
  const table = document.getElementById('mgtable');
  if (!xls || !table) return;
  // Scrub => reversible: al bajar el Excel se desvanece y la tabla materializa;
  // al subir, ambos vuelven a su estado. Pronunciado (blur + escala).
  const tl = gsap.timeline({
    scrollTrigger: { trigger: '#transformacion', start: 'top 62%', end: 'center 42%', scrub: 0.8 },
  });
  tl.fromTo(xls,
    { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
    { opacity: 0.12, y: -26, scale: 0.88, filter: 'blur(6px)', ease: 'none' }, 0)
    .fromTo(table,
    { opacity: 0.15, y: 46, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, ease: 'none' }, 0);
}

/* ---- Entrada animada del formulario de contacto (stagger de campos) ---- */
function formReveal() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  gsap.from(form.querySelectorAll('.cform__field, button'), {
    opacity: 0, y: 22, duration: 0.5, ease: 'power2.out', stagger: 0.08,
    scrollTrigger: { trigger: form, start: 'top 85%' },
  });
}

if (HAS_GSAP) {
const mm = gsap.matchMedia();

// Entradas ligeras: en cualquier tamaño (siempre que no haya reduce-motion)
mm.add('(prefers-reduced-motion: no-preference)', () => {
  heroIntro();
  headings();
  journey();
  mapSimAnimation();
  revealAll();
  counters();
  formReveal();
  xTransition();
});

// Escritorio: parallax del fondo del hero + roadmap pineado
mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
  parallaxLayers();
  roadSteps();
});

// Showcase horizontal: pineado en desktop
mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
  horizontalShowcase();
});

// Recalcula posiciones de todos los triggers cuando cargan imágenes/fuentes
// (evita que las animaciones tras el showcase pineado queden mal ubicadas).
window.addEventListener('load', () => ScrollTrigger.refresh());
} // fin if (HAS_GSAP)

/* Fallback de contadores: si hay reduce-motion o GSAP no cargó, muestra el
   valor final (evita que se queden en "0"). */
if (!HAS_GSAP || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[data-counter]').forEach((el) => {
    el.textContent = (el.dataset.prefix || '') + el.dataset.counter + (el.dataset.suffix || '');
  });
}

/* ============================================================
   Tabla MapGestión FUNCIONAL — buscador + filtros (sin depender de GSAP)
   Para usar tus datos reales: reemplaza el array `data` (MVA, Categoría,
   Modelo, Placas, Estado, Ubicación). Estados válidos: LISTO, PREPARACION,
   TALLER, PATIO.
   ============================================================ */
(function mgTable() {
  const body = document.getElementById('mgBody');
  if (!body) return;
  const search = document.getElementById('mgSearch');
  const filters = document.getElementById('mgFilters');
  const countEl = document.getElementById('mgCount');

  const COLORS = { LISTO: '#34d399', PREPARACION: '#fbbf24', TALLER: '#f87171', PATIO: '#818cf8' };
  const LABEL = { LISTO: 'Listo', PREPARACION: 'Preparación', TALLER: 'Taller', PATIO: 'En patio' };
  // Nivel de gasolina: E < 1/4 < 3/8 < H < 15/16 < F (orden + % del tanque)
  const FUEL_ORDER = { 'E': 0, '1/4': 1, '3/8': 2, 'H': 3, '15/16': 4, 'F': 5 };
  const FUEL_PCT = { 'E': 6, '1/4': 25, '3/8': 37.5, 'H': 50, '15/16': 94, 'F': 100 };
  // Fila: [MVA, Categoría, Modelo, Placas, Estado, Ubicación, Gasolina]
  const data = [
    ['D5129', 'ECAR', 'Aveo Sedan LT', 'GHB972G', 'LISTO', 'Patio', 'F'],
    ['D5256', 'ECAR', 'Aveo Sedan LT', 'GHD748G', 'LISTO', 'Patio', '3/8'],
    ['F1161', 'FCAR', 'Jetta Comfortline', 'DNF918J', 'PREPARACION', 'Lavado', '1/4'],
    ['I166', 'FFBH', 'Tank 300 HEV', '77L136', 'TALLER', 'Taller', 'E'],
    ['I174', 'FFBH', 'Tank 300 HEV', '76L936', 'LISTO', 'Patio', 'H'],
    ['M159', 'PFAR', 'Suburban LT', 'DSR767E', 'PATIO', 'Fila 3', '15/16'],
    ['M164', 'PFAR', 'Suburban LT', 'DPW207G', 'LISTO', 'Patio', 'F'],
    ['Q234', 'MVAR', 'GN8 GT', 'GYR575F', 'PREPARACION', 'Detalle', '1/4'],
    ['S034', 'IVAH', 'Sienna LE 8P', '76L482', 'LISTO', 'Patio', 'H'],
    ['N372', 'GVBB', 'Transporter 6.1', 'GUB032F', 'TALLER', 'Taller', 'E'],
    ['C2926', 'FCAR', 'Ford Edge', 'TTC486A', 'PATIO', 'Externo', '3/8'],
    ['B2380', 'ECAR', 'Onix LT', 'GRB110F', 'LISTO', 'Patio', 'F'],
    ['Z018', 'SMCAT', 'Versa Sense', 'CWP533J', 'PREPARACION', 'Lavado', '1/4'],
    ['A1842', 'ECAR', 'Kicks Advance', 'GNK802E', 'PATIO', 'Fila 1', '15/16'],
    ['C5209', 'FFBH', 'CX-5 Signature', '76P210', 'TALLER', 'Taller', 'H'],
  ];

  let q = '', f = 'all', sortDir = 0; // 0 sin orden, -1 menor→mayor (E→F), 1 mayor→menor (F→E)
  const cols = {};
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fuelColor = (p) => (p < 25 ? '#f87171' : p < 55 ? '#fbbf24' : '#34d399');

  document.querySelectorAll('#mgtable .mgsel').forEach((sel) => {
    const col = +sel.dataset.col;
    cols[col] = '';
    [...new Set(data.map((r) => r[col]))].sort().forEach((v) => {
      const o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o);
    });
    sel.addEventListener('change', () => { cols[col] = sel.value; render(); });
  });

  function render() {
    let rows = data.filter((r) => {
      const okF = f === 'all' || r[4] === f;
      const okQ = !q || (r[0] + ' ' + r[2] + ' ' + r[3]).toLowerCase().includes(q);
      const okCols = Object.keys(cols).every((c) => !cols[c] || r[c] === cols[c]);
      return okF && okQ && okCols;
    });
    if (sortDir !== 0) rows = rows.slice().sort((a, b) => (FUEL_ORDER[a[6]] - FUEL_ORDER[b[6]]) * sortDir);
    body.innerHTML = rows.length
      ? rows.map((r) => {
          const p = FUEL_PCT[r[6]];
          return `<tr>
            <td class="mg-mva">${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td>
            <td><span class="mg-fuel"><span class="mg-fuel__bar" style="width:${p}%;background:${fuelColor(p)}"></span></span><b class="mg-fuel__lbl">${esc(r[6])}</b></td>
            <td><span class="mg-badge" style="--c:${COLORS[r[4]]}">${LABEL[r[4]]}</span></td>
            <td>${esc(r[5])}</td></tr>`;
        }).join('')
      : '<tr class="mgtable__empty"><td colspan="7">Sin resultados para tu búsqueda.</td></tr>';
    countEl.textContent = `Mostrando ${rows.length} de ${data.length} unidades`;
  }

  // Orden por nivel de gasolina al clicar el encabezado (ciclo: F→E, E→F, sin orden)
  const sortBtn = document.getElementById('mgSortFuel');
  if (sortBtn) sortBtn.addEventListener('click', () => {
    sortDir = sortDir === 0 ? 1 : sortDir === 1 ? -1 : 0;
    sortBtn.dataset.dir = sortDir;
    const ic = sortBtn.querySelector('.mg-sort__ic');
    if (ic) ic.textContent = sortDir === 1 ? 'arrow_downward' : sortDir === -1 ? 'arrow_upward' : 'unfold_more';
    render();
  });

  search.addEventListener('input', () => { q = search.value.trim().toLowerCase(); render(); });
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.mgchip'); if (!btn) return;
    filters.querySelectorAll('.mgchip').forEach((b) => b.classList.toggle('is-active', b === btn));
    f = btn.dataset.f; render();
  });
  render();
})();

/* ============================================================
   Formulario de contacto — envío AJAX a Formspree (sin backend).
   Pega tu ID en el action del <form>. Si sigue en YOUR_FORM_ID,
   avisa y sugiere WhatsApp.
   ============================================================ */
(function contactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const btn = document.getElementById('cformBtn');
  const status = document.getElementById('cformStatus');
  const configured = !form.action.includes('YOUR_FORM_ID');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!configured) {
      status.className = 'cform__status err';
      status.textContent = 'Formulario aún sin configurar — escríbenos por WhatsApp mientras tanto.';
      return;
    }
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Enviando…';
    status.className = 'cform__status'; status.textContent = '';
    try {
      const res = await fetch(form.action, {
        method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('bad response');
      form.reset();
      status.className = 'cform__status ok';
      status.textContent = '¡Gracias! Te contactamos muy pronto.';
    } catch (_) {
      status.className = 'cform__status err';
      status.textContent = 'No se pudo enviar. Intenta de nuevo o escríbenos por WhatsApp.';
    } finally {
      btn.disabled = false; btn.textContent = label;
    }
  });
})();

