/* ============================================================
   MapGestión landing — app.js
   Movimiento tipo Apple (GSAP + ScrollTrigger, responsive con gsap.matchMedia)
   + carruseles (rail) + barra móvil + menú + tabla + formulario
   ============================================================ */

const HAS_GSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Sin GSAP o con reduced-motion: todo visible en su estado final (el CSS solo oculta con html.js)
if (!HAS_GSAP || REDUCED) document.documentElement.classList.remove('js');

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- utilidades ---------- */
// Desplazamiento de entrada proporcional al alto de pantalla (sin px fijos): 16–44px
const rise = () => gsap.utils.clamp(16, 44, window.innerHeight * 0.045);
const EASE = 'expo.out';
const EASE_SOFT = 'power3.out';

// Parte un titular en palabras (<span class="w">), respetando elementos internos (.grad) y .sr-only.
function splitWords(el) {
  if (el.dataset.split) return el.querySelectorAll('.w');
  el.dataset.split = '1';
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((n) => {
    if (n.parentElement.closest('.sr-only') || !n.textContent.trim()) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
      const w = document.createElement('span');
      w.className = 'w';
      w.textContent = part;
      frag.appendChild(w);
    });
    n.replaceWith(frag);
  });
  return el.querySelectorAll('.w');
}

/* ---------- 1. Hero: zoom suave de la foto y salida del texto al hacer scroll ---------- */
function heroScroll() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4, invalidateOnRefresh: true },
  })
    .fromTo('.hero__media', { scale: 1, yPercent: 0 }, { scale: 1.12, yPercent: 7, duration: 1 }, 0)
    .to('.hero__content', { yPercent: -14, duration: 1 }, 0)
    .to('.hero__content', { opacity: 0, duration: 0.45 }, 0.4)
    .to('.hero__scroll', { opacity: 0, duration: 0.15 }, 0);
}

/* ---------- 2. Titulares: palabras que suben y aparecen ---------- */
function headlines() {
  gsap.utils.toArray('.section-title, .trust__title, .cta__inner h2').forEach((el) => {
    const words = splitWords(el);
    gsap.fromTo(words, { opacity: 0, yPercent: 55 }, {
      opacity: 1, yPercent: 0, duration: 1, ease: EASE, stagger: 0.04,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
  gsap.utils.toArray('.section-sub, .eyebrow, .cta__inner > p').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: rise }, {
      opacity: 1, y: 0, duration: 1, ease: EASE_SOFT, delay: 0.12,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });
}

/* ---------- 3. Reveals por lotes (tarjetas y filas en cascada) ---------- */
const REVEAL_SEL = [
  '.rules li', '.trust__grid li', '.vf__net', '.rx-card', '.rx-step', '.rx-tile', '.code', '.guard li', '.pipe',
].join(', ');
function reveals(extra = []) {
  const items = [...new Set([...gsap.utils.toArray(REVEAL_SEL), ...extra])];
  gsap.set(items, { opacity: 0, y: rise });
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1, y: 0, duration: 1.05, ease: EASE_SOFT, stagger: 0.08, overwrite: true, clearProps: 'transform',
    }),
  });
}

/* ---------- 4. IA: usos rápidos con pestañas (ver quTabs al final) ---------- */

/* ---------- 8. Verificación 110: cada fuente se consulta en orden y aparece el resultado ---------- */
function vfSequence() {
  const list = document.getElementById('vfChecks');
  if (!list) return undefined;
  const items = [...list.querySelectorAll('li')];
  const ticks = items.map((li) => li.querySelector('.tick'));
  const finals = ticks.map((t) => [...t.classList].find((c) => c.startsWith('tick--')));
  const ems = items.map((li) => li.querySelector('em'));
  const texts = ems.map((e) => e.textContent);
  const done = (i) => {
    ticks[i].classList.remove('tick--wait');
    ticks[i].classList.add(finals[i]);
    ems[i].textContent = texts[i];
  };
  ticks.forEach((t, i) => { t.classList.remove(finals[i]); t.classList.add('tick--wait'); ems[i].textContent = 'Consultando…'; });
  const tl = gsap.timeline({ scrollTrigger: { trigger: '#vfApp', start: 'top 65%', once: true } });
  items.forEach((_, i) => tl.call(done, [i], 0.3 + i * 0.38));
  // Al terminar muestra el resultado que corresponde a la identificación capturada
  const result = document.querySelector('#vfApp .vfapp__result');
  tl.call(() => { if (result && result.railGo) result.railGo(2); }, null, 0.3 + items.length * 0.38 + 0.2);
  return () => { tl.kill(); items.forEach((_, i) => done(i)); };
}

/* ---------- 9. Historia: chat y radio → Excel → sistema viejo → MapGestión (escena fija de 5 pasos) ---------- */
const CHAOS_IDS = ['chaosChat', 'chaosXls', 'chaosOld', 'chaosNew', 'chaosTable'];
const CHAOS_VH = 4.2; // alto de scroll de la escena, en pantallas

function chaosPinned() {
  const root = document.getElementById('transformacion');
  const pin = root && root.querySelector('.chaos__pin');
  const capEl = document.getElementById('chaosCap');
  const layers = CHAOS_IDS.map((id) => document.getElementById(id));
  if (!pin || !capEl || layers.some((l) => !l)) return undefined;
  const caps = layers.map((l) => (l.querySelector('.chaos__label h3') || {}).textContent.trim());
  const dots = [...root.querySelectorAll('.chaos__dots button')];
  const N = layers.length;
  const S = 1 / N;

  root.classList.add('is-pinned');
  capEl.textContent = caps[0];
  let cur = 0;
  const mark = (i) => dots.forEach((d, j) => { d.classList.toggle('is-on', j <= i); d.setAttribute('aria-current', String(j === i)); });
  mark(0);
  const swap = (i) => {
    if (i === cur) return;
    cur = i;
    mark(i);
    gsap.to(capEl, {
      opacity: 0, yPercent: -12, duration: 0.16, ease: 'power2.in', overwrite: true,
      onComplete: () => {
        capEl.textContent = caps[i];
        gsap.fromTo(capEl, { opacity: 0, yPercent: 14 }, { opacity: 1, yPercent: 0, duration: 0.5, ease: EASE });
      },
    });
  };

  // Burbujas del chat y de la radio: aparecen como conversación
  gsap.fromTo(layers[0].querySelectorAll('.wa__bubble, .wa__typing, .radio__msg'), { opacity: 0, y: rise }, {
    opacity: 1, y: 0, duration: 0.6, ease: EASE_SOFT, stagger: 0.2,
    scrollTrigger: { trigger: root, start: 'top 65%', once: true },
  });

  gsap.set(layers.slice(1), { opacity: 0, yPercent: 8, scale: 0.96 });
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: () => '+=' + Math.round(window.innerHeight * CHAOS_VH),
      scrub: 0.6,
      pin: pin,
      anticipatePin: 1,
      refreshPriority: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => swap(Math.min(N - 1, Math.floor((self.progress + 0.03) / S))),
    },
  });
  for (let i = 0; i < N - 1; i++) {
    tl.to(layers[i], { opacity: 0, yPercent: -6, scale: 0.94, duration: 0.05 }, (i + 1) * S - 0.05)
      .to(layers[i + 1], { opacity: 1, yPercent: 0, scale: 1, duration: 0.05 }, (i + 1) * S - 0.03);
  }
  // Detalles que entran dentro de cada paso
  tl.fromTo(layers[1].querySelectorAll('.xls__grid tbody tr'), { opacity: 0.2 }, { opacity: 1, stagger: 0.012, duration: 0.04 }, S + 0.03)
    .fromTo(layers[2].querySelectorAll('.lgc__pin, .cmp__notes li'), { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, stagger: 0.012, duration: 0.03 }, 2 * S + 0.04)
    .fromTo(layers[3].querySelectorAll('.cmp__facts li'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.015, duration: 0.04 }, 3 * S + 0.04)
    .to({}, { duration: 0.04 }, 1 - 0.04);

  const goTo = (i) => {
    const st = tl.scrollTrigger;
    const y = st.start + (st.end - st.start) * (i * S + S * 0.5 - (i === 0 ? 0 : 0.02));
    window.scrollTo({ top: y, behavior: 'smooth' });
  };
  const onDot = dots.map((d, i) => { const f = () => goTo(i); d.addEventListener('click', f); return f; });

  return () => {
    root.classList.remove('is-pinned');
    capEl.textContent = caps[0];
    gsap.set(capEl, { clearProps: 'all' });
    dots.forEach((d, i) => d.removeEventListener('click', onDot[i]));
  };
}

/* ---------- 8b. Verificación 110 en 4 pasos: se enciende solo al llegar (y con "Repetir"); sin JS o con reduced-motion: 4 pasos visibles ---------- */
function stepper() {
  const root = document.getElementById('st4');
  if (!root) return undefined;
  const steps = [...root.querySelectorAll('.st4__step')];
  const btn = document.getElementById('st4Replay');
  root.classList.add('st4--anim');
  if (btn) btn.hidden = false;
  const show = (n) => steps.forEach((s, i) => s.classList.toggle('is-on', i < n));
  let tl = null;
  const run = () => {
    if (tl) tl.kill();
    show(0);
    gsap.set(root, { '--p': 0 });
    tl = gsap.timeline();
    steps.forEach((_, i) => {
      tl.call(() => show(i + 1), null, 0.15 + i * 1.15);
      if (i > 0) tl.to(root, { '--p': i / (steps.length - 1), duration: 0.9, ease: 'power2.inOut' }, 0.15 + i * 1.15 - 0.9);
    });
  };
  show(0);
  root.style.setProperty('--p', '0');
  const st = ScrollTrigger.create({ trigger: root, start: 'top 75%', once: true, onEnter: run });
  if (btn) btn.addEventListener('click', run);
  return () => {
    st.kill(); if (tl) tl.kill();
    if (btn) { btn.hidden = true; btn.removeEventListener('click', run); }
    root.classList.remove('st4--anim'); root.style.removeProperty('--p'); steps.forEach((s) => s.classList.remove('is-on'));
  };
}

/* ---------- 10. Formulario ---------- */
function formReveal() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  gsap.fromTo(form.querySelectorAll('.cform__field, button'), { opacity: 0, y: rise }, {
    opacity: 1, y: 0, duration: 0.9, ease: EASE_SOFT, stagger: 0.07,
    scrollTrigger: { trigger: form, start: 'top 85%', once: true },
  });
}

if (HAS_GSAP) {
  gsap.registerPlugin(ScrollTrigger);
  // La barra de URL del móvil cambia el alto: no recalcular por eso (evita saltos)
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Se arranca después del primer frame: así el primer layout completo de la página lo hace el
  // navegador al pintar (antes del FCP) y no un getBoundingClientRect forzado (TBT).
  const startMotion = () => {
  const mm = gsap.matchMedia();
  mm.add({
    motion: '(prefers-reduced-motion: no-preference)',
    // La escena fija solo si cabe en alto (cabecera + capa más alta ≈ 560px)
    pinnable: '(prefers-reduced-motion: no-preference) and (min-height: 600px)',
  }, (ctx) => {
    const { motion, pinnable } = ctx.conditions;
    if (!motion) return undefined;
    // Orden = orden en la página: el pin va ANTES que los triggers de abajo para que estos
    // cuenten el espacio que agrega. Se crea en tareas cortas (una por bloque) para no bloquear
    // el hilo principal durante la carga (TBT). El h1 ya entra por CSS.
    const cleanups = [];
    const steps = [
      heroScroll,
      () => (pinnable ? chaosPinned() : undefined),
      headlines,
      vfSequence,
      stepper,
      formReveal,
      // Pantallas bajas (p. ej. 844×390, 320×568): sin pin; cada escena entra con fade + subida
      () => reveals(pinnable ? [] : gsap.utils.toArray('.chaos__layer')),
    ];
    let alive = true;
    const next = () => {
      if (!alive) return;
      const step = steps.shift();
      if (!step) { ScrollTrigger.sort(); return; }
      ctx.add(() => { const c = step(); if (typeof c === 'function') cleanups.push(c); });
      setTimeout(next, 0);
    };
    setTimeout(next, 0);
    return () => { alive = false; cleanups.forEach((c) => c()); };
  });
  };
  requestAnimationFrame(() => setTimeout(startMotion, 0));

  // ScrollTrigger ya recalcula solo en 'load'; si las fuentes llegan después, recalcular una vez más
  if (document.fonts && document.fonts.status !== 'loaded') {
    document.fonts.ready.then(() => { if (document.readyState === 'complete') ScrollTrigger.refresh(); });
  }
}

/* Barra de progreso del recorrido (sin GSAP; se oculta con reduced-motion por CSS) */
(function progress() {
  const bar = document.querySelector('#progress i');
  if (!bar || REDUCED) return;
  let raf = 0;
  const upd = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ')';
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
  window.addEventListener('resize', upd);
  upd();
})();

/* Clips: se reproducen solo cuando están a la vista. Sin audio, en bucle, con botón de pausa.
   prefers-reduced-motion o ahorro de datos: solo el póster (y el botón para verlo a demanda si hay ahorro de datos). */
(function clips() {
  const figs = [...document.querySelectorAll('.clip')];
  if (!figs.length) return;
  const conn = navigator.connection || {};
  const saver = !!conn.saveData;
  if (REDUCED) return; // se queda el póster; sin botón
  document.documentElement.classList.add('clips--ready');
  const icon = (f, name) => { const i = f.querySelector('.clip__btn .material-symbols-outlined'); if (i) i.textContent = name; };
  const state = new WeakMap();
  const play = (f) => {
    const v = f.querySelector('video');
    const p = v.play();
    f.classList.add('is-playing', 'has-played'); icon(f, 'pause');
    f.querySelector('.clip__btn').setAttribute('aria-label', 'Pausar animación');
    if (p && p.catch) p.catch(() => { f.classList.remove('is-playing'); icon(f, 'play_arrow'); });
  };
  const pause = (f) => {
    f.querySelector('video').pause();
    f.classList.remove('is-playing'); icon(f, 'play_arrow');
    f.querySelector('.clip__btn').setAttribute('aria-label', 'Reproducir animación');
  };
  figs.forEach((f) => {
    state.set(f, { manual: false });
    f.querySelector('.clip__btn').addEventListener('click', () => {
      const s = state.get(f);
      if (f.classList.contains('is-playing')) { s.manual = true; pause(f); } else { s.manual = false; play(f); }
    });
  });
  if (saver || !('IntersectionObserver' in window)) return; // ahorro de datos: solo a demanda
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const f = e.target; const s = state.get(f);
      if (e.isIntersecting && e.intersectionRatio >= 0.5) { if (!s.manual && !f.classList.contains('is-playing')) play(f); }
      else if (f.classList.contains('is-playing')) pause(f);
    });
  }, { threshold: [0, 0.5, 0.75] });
  figs.forEach((f) => io.observe(f));
  document.addEventListener('visibilitychange', () => { if (document.hidden) figs.forEach((f) => { if (f.classList.contains('is-playing')) pause(f); }); });
})();

/* Escaparate "Míralo en movimiento": 5 animaciones, una sola a la vez. Se reproduce al verse, avanza sola a la siguiente,
   con pausa / repetir, pestañas y deslizar en el celular. Reduced-motion o ahorro de datos: cuadros fijos (sin autoplay). */
(function showcase() {
  const root = document.getElementById('show');
  if (!root) return;
  const stage = root.querySelector('.show__stage');
  const posters = [...stage.querySelectorAll('.show__poster')];
  const vids = [...stage.querySelectorAll('.show__v')];
  const tabs = [...root.querySelectorAll('.show__tab')];
  const capEl = root.querySelector('.show__cap');
  const playBtn = root.querySelector('.show__play');
  const repBtn = root.querySelector('.show__replay');
  const n = vids.length;
  if (!n || tabs.length !== n || posters.length !== n) return;
  root.classList.add('show--ready');
  const caps = tabs.map((t) => t.querySelector('small').textContent);
  const saver = !!(navigator.connection && navigator.connection.saveData);
  let idx = 0;
  let inView = false;
  let paused = REDUCED || saver; // el usuario (o el sistema) eligió no reproducir

  const ui = () => {
    const playing = !paused;
    const ic = playBtn.querySelector('.material-symbols-outlined');
    ic.textContent = playing ? 'pause' : 'play_arrow';
    playBtn.setAttribute('aria-label', playing ? 'Pausar animación' : 'Reproducir animación');
  };
  const start = () => {
    const v = vids[idx];
    if (REDUCED || paused || !inView || document.hidden) return;
    if (v.ended) v.currentTime = 0;
    const p = v.play();
    v.classList.add('has-played');
    if (p && p.catch) p.catch(() => { paused = true; ui(); });
  };
  const select = (i, fromStart) => {
    idx = (i + n) % n;
    vids.forEach((v, j) => { if (j !== idx) { v.pause(); v.currentTime = 0; tabs[j].style.setProperty('--f', '0'); } });
    posters.forEach((p, j) => p.classList.toggle('is-active', j === idx));
    vids.forEach((v, j) => v.classList.toggle('is-active', j === idx));
    tabs.forEach((t, j) => t.setAttribute('aria-current', String(j === idx)));
    capEl.textContent = caps[idx];
    const t = tabs[idx];
    if (t.parentElement.scrollWidth > t.parentElement.clientWidth) {
      t.parentElement.scrollTo({ left: Math.max(0, t.offsetLeft - 16), behavior: REDUCED ? 'auto' : 'smooth' });
    }
    if (fromStart) vids[idx].currentTime = 0;
    start();
  };
  vids.forEach((v, i) => {
    v.addEventListener('timeupdate', () => { if (v.duration) tabs[i].style.setProperty('--f', (v.currentTime / v.duration).toFixed(3)); });
    v.addEventListener('ended', () => { tabs[i].style.setProperty('--f', '1'); if (!paused && !REDUCED) select(i + 1, true); });
  });
  tabs.forEach((t, i) => t.addEventListener('click', () => {
    if (!REDUCED) { paused = false; ui(); }
    select(i, true);
  }));
  playBtn.addEventListener('click', () => {
    paused = !paused; ui();
    if (paused) vids[idx].pause(); else start();
  });
  repBtn.addEventListener('click', () => { paused = false; ui(); vids[idx].currentTime = 0; start(); });
  // Deslizar en el celular
  let x0 = null;
  stage.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 45) { if (!REDUCED && !saver) { paused = false; ui(); } select(idx + (dx < 0 ? 1 : -1), true); }
  }, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        inView = e.isIntersecting && e.intersectionRatio >= 0.4;
        if (inView) start(); else vids[idx].pause();
      });
    }, { threshold: [0, 0.4, 0.7] }).observe(stage);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) vids[idx].pause(); else start(); });
  ui();
  select(0, false);
})();

/* IA: usos rápidos. Pestañas + avance automático (la barra de cada pestaña es el temporizador, en CSS). Sin JS: las 5 tarjetas apiladas. */
(function quTabs() {
  const root = document.getElementById('quRail');
  if (!root) return;
  const steps = [...root.querySelectorAll('.qu__step')];
  const tabs = [...root.querySelectorAll('.qu__tab')];
  const ctl = root.querySelector('.qu__ctl');
  const n = steps.length;
  if (!n || tabs.length !== n) return;
  root.classList.add('qu--ready');
  let idx = 0;
  let auto = !REDUCED;
  let inView = false;
  const apply = () => {
    steps.forEach((s, j) => s.classList.toggle('is-active', j === idx));
    tabs.forEach((t, j) => t.setAttribute('aria-current', String(j === idx)));
    root.classList.toggle('qu--auto', auto && inView);
    if (ctl) {
      ctl.querySelector('.material-symbols-outlined').textContent = auto ? 'pause' : 'play_arrow';
      ctl.querySelector('span:last-child').textContent = auto ? 'Pausar' : 'Seguir';
      ctl.setAttribute('aria-label', auto ? 'Pausar demostración' : 'Seguir demostración');
    }
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => { idx = i; apply(); }));
  if (ctl) ctl.addEventListener('click', () => { auto = !auto; apply(); });
  root.addEventListener('animationend', (e) => { if (e.animationName === 'quFill') { idx = (idx + 1) % n; apply(); } });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; apply(); }, { threshold: 0.35 }).observe(root);
  }
  apply();
})();

/* Carruseles (rail): scroll-snap nativo + chips/flechas sincronizados. Independiente de GSAP. */
(function rails() {
  document.querySelectorAll('[data-rail]').forEach((rail) => {
    const track = rail.querySelector('.rail__track');
    if (!track) return;
    const slides = [...track.children];
    if (!slides.length) return;
    const chips = [...rail.querySelectorAll('.rail__chip')];
    const arrows = [...rail.querySelectorAll('.rail__arrow')];
    rail.classList.add('rail--ready');
    let idx = -1;
    const pos = (i) => slides[i].offsetLeft - slides[0].offsetLeft;
    const go = (i) => {
      const n = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: pos(n), behavior: REDUCED ? 'auto' : 'smooth' });
    };
    const update = () => {
      const x = track.scrollLeft;
      let best = 0;
      let bd = Infinity;
      slides.forEach((_, i) => { const d = Math.abs(pos(i) - x); if (d < bd) { bd = d; best = i; } });
      if (x > 0 && x + track.clientWidth >= track.scrollWidth - 2) best = slides.length - 1;
      if (best === idx) return;
      idx = best;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
      chips.forEach((c, i) => c.setAttribute('aria-current', String(i === idx)));
      arrows.forEach((a) => {
        const d = +a.dataset.dir;
        a.disabled = (d < 0 && idx === 0) || (d > 0 && idx === slides.length - 1);
      });
    };
    let raf = 0;
    track.addEventListener('scroll', () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); });
    }, { passive: true });
    chips.forEach((c) => c.addEventListener('click', () => go(+c.dataset.go)));
    arrows.forEach((a) => a.addEventListener('click', () => go(idx + +a.dataset.dir)));
    window.addEventListener('resize', () => { idx = -1; update(); });
    rail.railGo = go;
    requestAnimationFrame(() => setTimeout(update, 0));
  });
})();

/* FAQ: <details> nativo (funciona sin JS). Con JS: altura animada, filtros por tema y entrada escalonada.
   Con prefers-reduced-motion no se anima nada: abre y cierra al instante. Teclado: Enter / Espacio en el summary. */
document.querySelectorAll('.faq').forEach(function faq(root) {
  const items = [...root.querySelectorAll('.faq__item')];
  if (!items.length) return;
  root.classList.add('faq--ready');
  const DUR = 420;
  const EZ = 'cubic-bezier(.16, 1, .3, 1)';
  const anims = new WeakMap();

  const run = (d, opening) => {
    const panel = d.querySelector('.faq__a');
    if (!panel) { d.open = opening; return; }
    if (REDUCED || !panel.animate) { d.open = opening; return; }
    const prev = anims.get(panel);
    const from = prev ? panel.getBoundingClientRect().height : (opening ? 0 : panel.offsetHeight);
    if (prev) prev.cancel();
    if (opening) {
      d.classList.remove('is-closing');
      d.open = true;
    } else {
      d.classList.add('is-closing');
    }
    const to = opening ? panel.scrollHeight : 0;
    panel.style.overflow = 'hidden';
    const a = panel.animate({ height: [from + 'px', to + 'px'] }, { duration: DUR, easing: EZ });
    anims.set(panel, a);
    a.onfinish = () => {
      anims.delete(panel);
      panel.style.overflow = '';
      if (!opening) { d.open = false; d.classList.remove('is-closing'); }
    };
    a.oncancel = () => { panel.style.overflow = ''; };
  };

  items.forEach((d) => {
    const sum = d.querySelector('summary');
    sum.addEventListener('click', (e) => {
      e.preventDefault();
      const opening = !d.open || d.classList.contains('is-closing');
      run(d, opening);
    });
  });

  // Filtros por tema
  const chips = [...root.querySelectorAll('.faq__chip')];
  chips.forEach((c) => c.addEventListener('click', () => {
    const cat = c.dataset.cat;
    chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    items.forEach((d) => { d.hidden = cat !== 'todas' && d.dataset.cat !== cat; });
    const shown = items.filter((d) => !d.hidden);
    shown.forEach((d, i) => { d.style.setProperty('--i', i); });
    if (!REDUCED) {
      shown.forEach((d) => d.classList.remove('is-in', 'is-settled'));
      requestAnimationFrame(() => requestAnimationFrame(() => shown.forEach((d) => d.classList.add('is-in'))));
    }
    const live = root.querySelector('.faq__live');
    if (live) live.textContent = `${shown.length} preguntas`;
  }));

  // Entrada escalonada al llegar a la lista
  const showAll = () => items.forEach((d) => d.classList.add('is-in', 'is-settled'));
  if (REDUCED || !('IntersectionObserver' in window)) { showAll(); return; }
  items.forEach((d, i) => d.style.setProperty('--i', i));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const d = e.target;
      d.classList.add('is-in');
      setTimeout(() => d.classList.add('is-settled'), 1200);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  items.forEach((d) => io.observe(d));
});

/* Resumen extendido: el índice marca el capítulo que se está leyendo (sin GSAP) */
(function tocSpy() {
  const links = [...document.querySelectorAll('.toc a')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const secs = [...map.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  const set = (id) => {
    links.forEach((a) => a.setAttribute('aria-current', String(a === map.get(id))));
    const a = map.get(id);
    const bar = a && a.closest('.toc');
    if (bar && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: Math.max(0, a.offsetLeft - 24), behavior: REDUCED ? 'auto' : 'smooth' });
  };
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) visible.add(e.target.id); else visible.delete(e.target.id); });
    const first = secs.find((s) => visible.has(s.id));
    if (first) set(first.id);
  }, { rootMargin: '-20% 0px -65% 0px' });
  secs.forEach((s) => io.observe(s));
  set(secs[0].id);
})();

/* Resumen extendido: paneles plegables (details). Animación de altura con WAAPI; sin reduced-motion. Sin JS todo queda abierto.
   Un enlace con #ancla (desde la home o el índice) abre el panel que contiene el destino. */
(function rxMore() {
  const panels = [...document.querySelectorAll('.rx-more')];
  if (!panels.length) return;
  const DUR = 380;
  const EZ = 'cubic-bezier(.16, 1, .3, 1)';
  const anims = new WeakMap();
  const run = (d, opening) => {
    const panel = d.querySelector('.rx-more__a');
    if (!panel || REDUCED || !panel.animate) { d.open = opening; return; }
    const prev = anims.get(panel);
    const from = prev ? panel.getBoundingClientRect().height : (opening ? 0 : panel.offsetHeight);
    if (prev) prev.cancel();
    if (opening) { d.classList.remove('is-closing'); d.open = true; } else { d.classList.add('is-closing'); }
    const to = opening ? panel.scrollHeight : 0;
    panel.style.overflow = 'hidden';
    const a = panel.animate({ height: [from + 'px', to + 'px'] }, { duration: DUR, easing: EZ });
    anims.set(panel, a);
    a.onfinish = () => { anims.delete(panel); panel.style.overflow = ''; if (!opening) { d.open = false; d.classList.remove('is-closing'); } };
    a.oncancel = () => { panel.style.overflow = ''; };
  };
  panels.forEach((d) => {
    d.querySelector('summary').addEventListener('click', (e) => {
      e.preventDefault();
      run(d, !d.open || d.classList.contains('is-closing'));
      syncAll();
    });
  });
  const all = document.getElementById('rxAll');
  const syncAll = () => {
    if (!all) return;
    const allOpen = panels.every((d) => d.open && !d.classList.contains('is-closing'));
    all.textContent = allOpen ? 'Cerrar todo' : 'Abrir todo';
  };
  if (all) {
    all.hidden = false;
    syncAll();
    all.addEventListener('click', () => {
      const allOpen = panels.every((d) => d.open);
      panels.forEach((d) => { d.open = !allOpen; });
      syncAll();
    });
  }
  const openFor = (id) => {
    if (!id) return;
    let t = null;
    try { t = document.getElementById(decodeURIComponent(id)); } catch (e) { t = null; }
    const d = t && t.closest('.rx-more');
    if (!d) return;
    if (!d.open) { d.open = true; syncAll(); }
    requestAnimationFrame(() => t.scrollIntoView({ block: 'start' }));
  };
  window.addEventListener('hashchange', () => openFor(location.hash.slice(1)));
  openFor(location.hash.slice(1));
  // Las imágenes y fuentes mueven el diseño después del primer salto: reubicar una vez al terminar de cargar
  if (location.hash.length > 1) window.addEventListener('load', () => setTimeout(() => openFor(location.hash.slice(1)), 250), { once: true });
})();

/* Barra fija en móvil: aparece después del hero y se oculta al llegar al formulario / footer */
(function mobileBar() {
  const bar = document.getElementById('mbar');
  const hero = document.getElementById('hero');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;
  let heroOn = true;
  const ends = new Set();
  const sync = () => bar.classList.toggle('is-on', !heroOn && ends.size === 0);
  new IntersectionObserver(([e]) => { heroOn = e.isIntersecting; sync(); }, { rootMargin: '-45% 0px 0px 0px' }).observe(hero);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) ends.add(e.target); else ends.delete(e.target); });
    sync();
  });
  ['contacto'].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  const foot = document.querySelector('.foot');
  if (foot) io.observe(foot);
})();

/* Menú móvil — independiente de GSAP */
(function mobileMenu() {
  const btn = document.getElementById('menuBtn');
  const drawer = document.getElementById('navDrawer');
  const overlay = document.getElementById('navOverlay');
  const closeBtn = document.getElementById('menuClose');
  if (!btn || !drawer || !overlay) return;

  const isOpen = () => drawer.classList.contains('is-open');
  function setOpen(open, { restoreFocus = true } = {}) {
    drawer.classList.toggle('is-open', open);
    overlay.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if (open) drawer.removeAttribute('inert'); else drawer.setAttribute('inert', '');
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) {
      const first = drawer.querySelector('.nav__drawer > a');
      if (first) setTimeout(() => first.focus(), 50);
    } else if (restoreFocus) {
      btn.focus();
    }
  }

  btn.addEventListener('click', () => setOpen(!isOpen()));
  overlay.addEventListener('click', () => setOpen(false));
  if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false));
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false, { restoreFocus: false });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setOpen(false);
  });
  window.matchMedia('(min-width: 1000px)').addEventListener('change', (mq) => {
    if (mq.matches && isOpen()) setOpen(false, { restoreFocus: false });
  });
})();

/* Tabla MapGestión — buscador + filtros */
(function mgTable() {
  const body = document.getElementById('mgBody');
  if (!body) return;
  const search = document.getElementById('mgSearch');
  const filters = document.getElementById('mgFilters');
  const countEl = document.getElementById('mgCount');

  const COLORS = { LISTO: '#10b981', PREPARACION: '#f59e0b', TALLER: '#ef4444', PATIO: '#3b82f6' }; // estados de la app (ESTILO.md)
  const LABEL = { LISTO: 'Listo', PREPARACION: 'Preparación', TALLER: 'Taller', PATIO: 'En patio' };
  const FUEL_ORDER = { 'E': 0, '1/4': 1, '3/8': 2, 'H': 3, '15/16': 4, 'F': 5 };
  // [MVA, Cat, Modelo, Placas, Gasolina, Km, Estado, Ubicación, Notas]
  const data = [
    ['D5129', 'ECAR', 'Aveo Sedan LT', 'GHB972G', 'F', 42810, 'LISTO', 'Patio', 'Listo para renta'],
    ['D5256', 'ECAR', 'Aveo Sedan LT', 'GHD748G', 'F', 39120, 'LISTO', 'Patio', 'Tanque lleno'],
    ['F1161', 'FCAR', 'Jetta Comfortline', 'DNF918J', '1/4', 61240, 'PREPARACION', 'Área de lavado', 'En cola de lavado'],
    ['I166', 'FFBH', 'Tank 300 HEV', '77L136', 'E', 88450, 'TALLER', 'Taller', 'Rayón puerta der.'],
    ['I174', 'FFBH', 'Tank 300 HEV', '76L936', 'H', 75200, 'LISTO', 'Patio B', ''],
    ['M159', 'PFAR', 'Suburban LT', 'DSR767E', '15/16', 112380, 'PATIO', 'Check in', 'Esperando cliente'],
    ['M164', 'PFAR', 'Suburban LT', 'DPW207G', 'F', 99810, 'LISTO', 'Patio', ''],
    ['Q234', 'MVAR', 'GN8 GT', 'GYR575F', '1/4', 54300, 'PREPARACION', 'Detalle', 'Falta gasolina'],
    ['S034', 'IVAH', 'Sienna LE 8P', '76L482', 'H', 67890, 'LISTO', 'Patio B', ''],
    ['N372', 'GVBB', 'Transporter 6.1', 'GUB032F', 'E', 145220, 'TALLER', 'Taller', 'Falla eléctrica'],
    ['C2926', 'FCAR', 'Ford Edge', 'TTC486A', '3/8', 82110, 'PATIO', 'Check in', 'Retorno externo'],
    ['B2380', 'ECAR', 'Onix LT', 'GRB110F', 'F', 21450, 'LISTO', 'Patio', ''],
    ['Z018', 'SMCAT', 'Versa Sense', 'CWP533J', '1/4', 35670, 'PREPARACION', 'Área de lavado', 'Pendiente revisión'],
    ['A1842', 'ECAR', 'Kicks Advance', 'GNK802E', '15/16', 48900, 'PATIO', 'Patio B', ''],
    ['C5209', 'FFBH', 'CX-5 Signature', '76P210', 'H', 91040, 'TALLER', 'Taller', 'Cambio de frenos'],
  ];

  let q = (search.value || '').trim().toLowerCase(), f = 'all';
  let sortFuel = 0; // 0 off, 1 desc, -1 asc
  let sortKm = 0;
  const cols = {};
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtKm = (n) => Number(n).toLocaleString('es-MX');

  document.querySelectorAll('#mgtable .mgsel').forEach((sel) => {
    const col = +sel.dataset.col;
    cols[col] = '';
    [...new Set(data.map((r) => r[col]))].sort().forEach((v) => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = (col === 6 && LABEL[v]) ? LABEL[v] : v;
      sel.appendChild(o);
    });
    sel.addEventListener('change', () => { cols[col] = sel.value; render(); });
  });

  function render() {
    let rows = data.filter((r) => {
      const okF = f === 'all' || r[6] === f;
      const okQ = !q || (r[0] + ' ' + r[2] + ' ' + r[3] + ' ' + r[8]).toLowerCase().includes(q);
      const okCols = Object.keys(cols).every((c) => !cols[c] || r[c] === cols[c]);
      return okF && okQ && okCols;
    });
    if (sortFuel !== 0) rows = rows.slice().sort((a, b) => (FUEL_ORDER[a[4]] - FUEL_ORDER[b[4]]) * sortFuel);
    if (sortKm !== 0) rows = rows.slice().sort((a, b) => (a[5] - b[5]) * sortKm);

    body.innerHTML = rows.length
      ? rows.map((r) => {
          const note = r[8] ? esc(r[8]) : '<span class="mg-note-empty">—</span>';
          return `<tr>
            <td class="mg-mva">${esc(r[0])}</td>
            <td>${esc(r[1])}</td>
            <td>${esc(r[2])}</td>
            <td>${esc(r[3])}</td>
            <td><b class="mg-fuel-lbl">${esc(r[4])}</b></td>
            <td class="mg-km">${fmtKm(r[5])}</td>
            <td><span class="mg-badge" style="--c:${COLORS[r[6]]}">${LABEL[r[6]]}</span></td>
            <td>${esc(r[7])}</td>
            <td class="mg-note">${note}</td>
          </tr>`;
        }).join('')
      : '<tr class="mgtable__empty"><td colspan="9">Sin resultados para tu búsqueda.</td></tr>';
    countEl.textContent = `Mostrando ${rows.length} de ${data.length} unidades`;
  }

  const cycleSort = (btn, which) => {
    if (which === 'fuel') {
      sortFuel = sortFuel === 0 ? 1 : sortFuel === 1 ? -1 : 0;
      sortKm = 0;
    } else {
      sortKm = sortKm === 0 ? 1 : sortKm === 1 ? -1 : 0;
      sortFuel = 0;
    }
    const fuelBtn = document.getElementById('mgSortFuel');
    const kmBtn = document.getElementById('mgSortKm');
    [[fuelBtn, sortFuel], [kmBtn, sortKm]].forEach(([b, dir]) => {
      if (!b) return;
      b.dataset.dir = dir;
      const ic = b.querySelector('.mg-sort__ic');
      if (ic) ic.textContent = dir === 1 ? 'arrow_downward' : dir === -1 ? 'arrow_upward' : 'unfold_more';
    });
    render();
  };

  const sortFuelBtn = document.getElementById('mgSortFuel');
  if (sortFuelBtn) sortFuelBtn.addEventListener('click', () => cycleSort(sortFuelBtn, 'fuel'));
  const sortKmBtn = document.getElementById('mgSortKm');
  if (sortKmBtn) sortKmBtn.addEventListener('click', () => cycleSort(sortKmBtn, 'km'));

  search.addEventListener('input', () => { q = search.value.trim().toLowerCase(); render(); });
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('.mgchip');
    if (!btn) return;
    filters.querySelectorAll('.mgchip').forEach((b) => b.classList.toggle('is-active', b === btn));
    f = btn.dataset.f;
    render();
  });
  render();
})();

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
    btn.disabled = true;
    btn.textContent = 'Enviando…';
    status.className = 'cform__status';
    status.textContent = '';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('bad response');
      form.reset();
      status.className = 'cform__status ok';
      status.textContent = '¡Gracias! Te contactamos muy pronto.';
    } catch (_) {
      status.className = 'cform__status err';
      status.textContent = 'No se pudo enviar. Intenta de nuevo o escríbenos por WhatsApp.';
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
})();

/* Player de video custom (sin controles nativos) */
(function mgVideoPlayer() {
  const root = document.getElementById('mgPlayer');
  if (!root) return;
  const shell = root.querySelector('.vplayer');
  const video = root.querySelector('.vplayer__video');
  if (!shell || !video) return;

  const big = root.querySelector('.vplayer__bigplay');
  const playBtn = root.querySelector('[data-vp="play"]');
  const muteBtn = root.querySelector('[data-vp="mute"]');
  const fsBtn = root.querySelector('[data-vp="fs"]');
  const seek = root.querySelector('[data-vp="seek"]');
  const fill = root.querySelector('[data-vp="fill"]');
  const buffer = root.querySelector('[data-vp="buffer"]');
  const curEl = root.querySelector('[data-vp="cur"]');
  const durEl = root.querySelector('[data-vp="dur"]');
  const playIcon = playBtn.querySelector('.material-symbols-outlined');
  const muteIcon = muteBtn.querySelector('.material-symbols-outlined');
  const fsIcon = fsBtn.querySelector('.material-symbols-outlined');

  let idleTimer = null;
  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + String(sec).padStart(2, '0');
  };

  const setPlayingUI = (playing) => {
    shell.classList.toggle('is-playing', playing);
    playIcon.textContent = playing ? 'pause' : 'play_arrow';
    playBtn.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
    big.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
  };

  const togglePlay = async () => {
    try {
      if (video.paused) await video.play();
      else video.pause();
    } catch (_) { /* autoplay / gesture */ }
  };

  const bumpIdle = () => {
    shell.classList.remove('is-idle');
    clearTimeout(idleTimer);
    if (!video.paused) {
      idleTimer = setTimeout(() => shell.classList.add('is-idle'), 2200);
    }
  };

  const syncProgress = () => {
    const d = video.duration || 0;
    const t = video.currentTime || 0;
    const pct = d ? (t / d) * 100 : 0;
    fill.style.width = pct + '%';
    seek.value = String(pct);
    curEl.textContent = fmt(t);
  };

  const syncBuffer = () => {
    try {
      if (!video.buffered.length || !video.duration) return;
      const end = video.buffered.end(video.buffered.length - 1);
      buffer.style.width = ((end / video.duration) * 100) + '%';
    } catch (_) { /* ignore */ }
  };

  playBtn.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
  big.addEventListener('click', (e) => { e.stopPropagation(); togglePlay(); });
  shell.addEventListener('click', (e) => {
    if (e.target.closest('.vplayer__controls')) return;
    togglePlay();
  });

  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    muteIcon.textContent = video.muted ? 'volume_off' : 'volume_up';
    muteBtn.setAttribute('aria-label', video.muted ? 'Activar sonido' : 'Silenciar');
  });

  fsBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    try {
      if (!document.fullscreenElement) {
        await (shell.requestFullscreen?.() || shell.webkitRequestFullscreen?.());
      } else {
        await (document.exitFullscreen?.() || document.webkitExitFullscreen?.());
      }
    } catch (_) { /* ignore */ }
  });

  const onFsChange = () => {
    const on = !!(document.fullscreenElement || document.webkitFullscreenElement);
    shell.classList.toggle('is-fs', on);
    fsIcon.textContent = on ? 'fullscreen_exit' : 'fullscreen';
    fsBtn.setAttribute('aria-label', on ? 'Salir de pantalla completa' : 'Pantalla completa');
  };
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);

  seek.addEventListener('input', () => {
    if (!video.duration) return;
    video.currentTime = (Number(seek.value) / 100) * video.duration;
    syncProgress();
    bumpIdle();
  });
  seek.addEventListener('click', (e) => e.stopPropagation());

  video.addEventListener('play', () => { setPlayingUI(true); bumpIdle(); });
  video.addEventListener('pause', () => { setPlayingUI(false); shell.classList.remove('is-idle'); });
  video.addEventListener('timeupdate', syncProgress);
  video.addEventListener('progress', syncBuffer);
  video.addEventListener('loadedmetadata', () => {
    durEl.textContent = fmt(video.duration);
    syncProgress();
    syncBuffer();
  });
  video.addEventListener('ended', () => {
    setPlayingUI(false);
    shell.classList.remove('is-idle');
  });

  shell.addEventListener('mousemove', bumpIdle);
  shell.addEventListener('touchstart', bumpIdle, { passive: true });

  shell.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay(); }
    if (e.key === 'm') muteBtn.click();
    if (e.key === 'f') fsBtn.click();
    if (e.key === 'ArrowRight') video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
    if (e.key === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 5);
  });
  shell.tabIndex = 0;
})();
