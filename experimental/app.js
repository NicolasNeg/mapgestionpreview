/* ============================================================
   MapGestión — prototipo inmersivo · app.js
   GSAP + ScrollTrigger + MotionPathPlugin + Lottie

   CÓMO AJUSTAR (lee estos comentarios):
   • scrub:  true = la animación sigue el scroll 1:1. Un número (p.ej. 1)
             añade "inercia" (segundos de suavizado). Súbelo para más lag.
   • start / end:  gatillos del scroll. Formato "posDelElemento posDelViewport".
             Ej. "top 80%" = cuando el top del elemento llega al 80% del viewport.
   • duration / stagger / ease:  velocidad y cascada de las entradas.
   • BASE_PARALLAX (abajo):  intensidad global del parallax en px.
   ============================================================ */

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

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

/* ============================================================
   Responsive con gsap.matchMedia:
   - Animaciones solo si el usuario NO pidió reduce-motion.
   - PC (≥768px): parallax + ruta con MotionPath.
   - Móvil (<768px): fade-ins ligeros.
   ============================================================ */
const mm = gsap.matchMedia();

// Entradas ligeras: en cualquier tamaño (siempre que no haya reduce-motion)
mm.add('(prefers-reduced-motion: no-preference)', () => {
  heroIntro();
  cardsStagger();
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

/* ============================================================
   LOTTIE — carga la animación y la reproduce en hover / al entrar.
   Sustituye 'path' por la URL de TU animación (.json export de LottieFiles).
   ============================================================ */
(function initLottie() {
  const container = document.getElementById('lottie-ops');
  if (!container || typeof lottie === 'undefined') return;

  const anim = lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: false, // no reproduce hasta hover / entrar en pantalla
    // ← Reemplaza por tu animación. Si esta URL pública no carga, pon la tuya.
    path: 'https://assets9.lottiefiles.com/packages/lf20_touohxv0.json',
  });

  // Reproduce al pasar el cursor (PC)
  container.addEventListener('mouseenter', () => anim.play());
  container.addEventListener('mouseleave', () => anim.pause());

  // Reproduce una vez al entrar en pantalla (útil en móvil)
  ScrollTrigger.create({
    trigger: container,
    start: 'top 85%',
    onEnter: () => anim.play(),
  });
})();
