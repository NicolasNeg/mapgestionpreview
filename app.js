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
  ScrollTrigger.create({
    trigger: j,
    start: 'top 60%',    // ← empieza cuando el recorrido entra
    end: 'bottom 75%',   // ← el auto llega al final
    onUpdate: (self) => {
      const p = self.progress * 100;
      fill.style.height = p + '%';
      car.style.top = p + '%';
    },
  });
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
  const arrow = document.querySelector('#transformacion .xarrow');
  const table = document.getElementById('mgtable');
  if (!xls || !table) return;
  const EASE = 'power3.out';
  ScrollTrigger.create({
    trigger: arrow || table,
    start: 'top 78%',
    once: true,
    onEnter: () => {
      // El Excel "se vacía": recede, se desenfoca y se atenúa
      gsap.to(xls, { opacity: 0.15, scale: 0.9, y: -18, filter: 'blur(5px)', duration: 0.8, ease: 'power2.inOut' });
      if (arrow) gsap.fromTo(arrow, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      // La tabla MapGestión "materializa": pop de escala + glow de acento
      gsap.fromTo(table,
        { scale: 0.96, y: 30, boxShadow: '0 0 0 rgba(129,140,248,0)' },
        { scale: 1, y: 0, boxShadow: '0 30px 80px rgba(129,140,248,.28)', duration: 0.9, ease: EASE, delay: 0.15 });
    },
  });
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

// Escritorio: parallax del fondo del hero
mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
  parallaxLayers();
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
  const data = [
    ['D5129', 'ECAR', 'Aveo Sedan LT', 'GHB972G', 'LISTO', 'Patio'],
    ['D5256', 'ECAR', 'Aveo Sedan LT', 'GHD748G', 'LISTO', 'Patio'],
    ['F1161', 'FCAR', 'Jetta Comfortline', 'DNF918J', 'PREPARACION', 'Lavado'],
    ['I166', 'FFBH', 'Tank 300 HEV', '77L136', 'TALLER', 'Taller'],
    ['I174', 'FFBH', 'Tank 300 HEV', '76L936', 'LISTO', 'Patio'],
    ['M159', 'PFAR', 'Suburban LT', 'DSR767E', 'PATIO', 'Fila 3'],
    ['M164', 'PFAR', 'Suburban LT', 'DPW207G', 'LISTO', 'Patio'],
    ['Q234', 'MVAR', 'GN8 GT', 'GYR575F', 'PREPARACION', 'Detalle'],
    ['S034', 'IVAH', 'Sienna LE 8P', '76L482', 'LISTO', 'Patio'],
    ['N372', 'GVBB', 'Transporter 6.1', 'GUB032F', 'TALLER', 'Taller'],
    ['C2926', 'FCAR', 'Ford Edge', 'TTC486A', 'PATIO', 'Externo'],
    ['B2380', 'ECAR', 'Onix LT', 'GRB110F', 'LISTO', 'Patio'],
    ['Z018', 'SMCAT', 'Versa Sense', 'CWP533J', 'PREPARACION', 'Lavado'],
    ['A1842', 'ECAR', 'Kicks Advance', 'GNK802E', 'PATIO', 'Fila 1'],
    ['C5209', 'FFBH', 'CX-5 Signature', '76P210', 'TALLER', 'Taller'],
  ];

  let q = '', f = 'all';
  const cols = {}; // por-columna: índice -> valor seleccionado ('' = todas)
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Poblar cada <select> con los valores únicos de su columna (filtro por columna)
  document.querySelectorAll('#mgtable .mgsel').forEach((sel) => {
    const col = +sel.dataset.col;
    cols[col] = '';
    [...new Set(data.map((r) => r[col]))].sort().forEach((v) => {
      const o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o);
    });
    sel.addEventListener('change', () => { cols[col] = sel.value; render(); });
  });

  function render() {
    const rows = data.filter((r) => {
      const okF = f === 'all' || r[4] === f;
      const okQ = !q || (r[0] + ' ' + r[2] + ' ' + r[3]).toLowerCase().includes(q);
      const okCols = Object.keys(cols).every((c) => !cols[c] || r[c] === cols[c]);
      return okF && okQ && okCols;
    });
    body.innerHTML = rows.length
      ? rows.map((r) => `<tr>
          <td class="mg-mva">${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td>
          <td><span class="mg-badge" style="--c:${COLORS[r[4]]}">${LABEL[r[4]]}</span></td>
          <td>${esc(r[5])}</td></tr>`).join('')
      : '<tr class="mgtable__empty"><td colspan="6">Sin resultados para tu búsqueda.</td></tr>';
    countEl.textContent = `Mostrando ${rows.length} de ${data.length} unidades`;
  }

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

