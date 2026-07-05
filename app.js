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
    { opacity: 0, y: 24 },
    {
      opacity: 1, y: 0,
      duration: 0.9,      // ← velocidad de cada elemento
      ease: 'power3.out',
      stagger: 0.12,      // ← separación entre líneas
      delay: 0.15,
    });
}

/* ---- Cards escalonadas (stagger) al entrar en viewport ---- */
function cardsStagger() {
  gsap.fromTo('.gsap-card',
    { opacity: 0, y: 30 },
    {
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      stagger: 0.12,      // ← cascada entre tarjetas
      scrollTrigger: {
        trigger: '#cards',
        start: 'top 80%', // ← gatillo: dispara al 80% del viewport
      },
    });
}

/* ---- Marcadores que se ACOMODAN en los spots del mapa (entrada con rebote) ---- */
function mapSimAnimation() {
  gsap.from('#mapSim .spot', {
    opacity: 0, scale: 0.3, y: -30,
    duration: 0.6,
    ease: 'back.out(1.7)',            // ← el rebote da el efecto de "encajar" en el spot
    stagger: { each: 0.08, from: 'random' }, // ← se colocan uno a uno, en orden aleatorio
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

/* ---- TRANSFORMACIÓN (desktop): timeline pineada ligada al scroll ----
   Sube 'end' (+=2600) para hacer TODA la secuencia más lenta/larga. */
function xformDesktop() {
  const cap = document.getElementById('xcap');
  gsap.set(['#xApp', '#xMap'], { opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#transformacion',
      start: 'top top',
      end: '+=2600',          // ← longitud total de la secuencia en px de scroll
      scrub: 1,               // ← ligado al scroll (1s de suavizado)
      pin: '.xform__sticky',  // ← fija la escena mientras dura la timeline
      anticipatePin: 1,
      onUpdate: (self) => {   // subtítulo según el avance
        const p = self.progress;
        cap.textContent = p < 0.34 ? 'Hoy: hojas de Excel y mensajes sueltos.'
          : p < 0.68 ? 'Con MapGestión: cada unidad, clara y a la vista.'
            : 'Y es un mapa real: pruébalo tú mismo.';
      },
    },
  });

  // 1) El Excel se VACÍA (celdas de datos) y se retira
  tl.to('#xExcel .xc', { opacity: 0, stagger: { each: 0.03, from: 'random' }, duration: 2 }, 0)
    .to('#xExcel', { opacity: 0, scale: 0.92, duration: 1 }, '>-0.3')
    // 2) Aparece el formato claro (tarjetas en cascada)
    .to('#xApp', { opacity: 1, duration: 1 }, '<')
    .from('#xApp .xcard', { opacity: 0, y: 24, stagger: 0.15, duration: 1.2, ease: 'power2.out' }, '<')
    .to('#xApp', { opacity: 0, scale: 0.96, duration: 1 }, '+=1')
    // 3) Aparece el mapa y las unidades se acomodan en sus spots
    .to('#xMap', { opacity: 1, duration: 1 }, '<')
    .from('#xMap .spot', { opacity: 0, scale: 0.3, y: -20, stagger: 0.12, ease: 'back.out(1.7)', duration: 1 }, '<0.2')
    .from('#xMap .xmap__try', { opacity: 0, y: 16, duration: 0.6 }, '>-0.2');
}

/* ---- TRANSFORMACIÓN (móvil): sin pin, 3 bloques con fade-in ---- */
function xformMobile() {
  gsap.utils.toArray('#transformacion .xpanel').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
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
    gsap.fromTo(el, { opacity: 0, y: 22 }, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
}

/* ---- Contadores animados (0 -> target) al entrar ---- */
function counters() {
  gsap.utils.toArray('[data-counter]').forEach((el) => {
    const target = +el.dataset.counter, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, {
        v: target, duration: 1.2, ease: 'power1.out',
        onUpdate: () => { el.textContent = pre + Math.round(o.v) + suf; },
      }),
    });
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

// Transformación Excel→mapa: pineada en desktop, apilada en móvil
mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
  xformDesktop();
});
mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
  xformMobile();
});
} // fin if (HAS_GSAP)

/* Fallback de contadores: si hay reduce-motion o GSAP no cargó, muestra el
   valor final (evita que se queden en "0"). */
if (!HAS_GSAP || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('[data-counter]').forEach((el) => {
    el.textContent = (el.dataset.prefix || '') + el.dataset.counter + (el.dataset.suffix || '');
  });
}

