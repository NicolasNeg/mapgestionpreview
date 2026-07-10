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
function cardsStagger() {
  // Reveal ligado al scroll: las tarjetas se descubren una a una al avanzar.
  gsap.fromTo('#cards .gsap-card',
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0, ease: 'power2.out',
      stagger: 1,         // ← en modo scrub se reparten a lo largo del recorrido
      scrollTrigger: {
        trigger: '#cards',
        start: 'top 85%',
        end: 'bottom 60%',
        scrub: 1,         // ← ligado al scroll (sube el número = más lento)
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

/* ---- Vehículo recorriendo la ruta SVG + trazo que se dibuja (scrub) ---- */
function routeAnimation() {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.route',
      start: 'top 75%',   // ← empieza cuando la ruta entra
      end: 'bottom 40%',  // ← termina cuando casi sale
      scrub: 1,           // ← ligado al scroll con 1s de suavizado
    },
  });
  // Dibuja la línea (pathLength=1 en el SVG => dashoffset 1→0)
  tl.fromTo('#route-fill', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none' }, 0);
  // Mueve el auto sobre #route, orientándolo con la curva
  tl.to('#car', {
    motionPath: { path: '#route', align: '#route', alignOrigin: [0.5, 0.5], autoRotate: true },
    ease: 'none',
  }, 0);
}

/* ---- Parallax de profundidad en elementos [data-parallax] ---- */
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

/* ---- Versión MÓVIL simplificada: solo fade-ins (mejor rendimiento táctil) ---- */
function mobileSimplified() {
  gsap.to('.car', { opacity: 1, duration: 0.6 });
  gsap.utils.toArray('.panel').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
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
    },
  });
}

/* ============================================================
   Responsive con gsap.matchMedia:
   - Animaciones solo si el usuario NO pidió reduce-motion.
   - PC (≥768px): parallax + ruta con MotionPath.
   - Móvil (<768px): fade-ins ligeros.
   ============================================================ */
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
    // Re-cuenta cada vez que entra en pantalla (desde arriba o abajo) => "siempre animado"
    const run = () => { o.v = 0; gsap.to(o, {
      v: target, duration: 1.4, ease: 'power1.out',
      onUpdate: () => { el.textContent = pre + Math.round(o.v) + suf; },
    }); };
    ScrollTrigger.create({ trigger: el, start: 'top 85%', onEnter: run, onEnterBack: run });
  });
}

if (HAS_GSAP) {
const mm = gsap.matchMedia();

// Entradas ligeras: en cualquier tamaño (siempre que no haya reduce-motion)
mm.add('(prefers-reduced-motion: no-preference)', () => {
  heroIntro();
  cardsStagger();
  mapSimAnimation();
  revealAll();
  counters();
});

// Escritorio: efectos pesados
mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
  routeAnimation();
  parallaxLayers();
});

// Móvil: simplificado
mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
  mobileSimplified();
});

// Showcase horizontal: pineado en desktop
mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
  horizontalShowcase();
});
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
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function render() {
    const rows = data.filter((r) => {
      const okF = f === 'all' || r[4] === f;
      const okQ = !q || (r[0] + ' ' + r[2] + ' ' + r[3]).toLowerCase().includes(q);
      return okF && okQ;
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

