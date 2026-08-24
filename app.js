/* ============================================================
   MapGestión landing — app.js
   Scroll suave + Excel→tabla + map spots + contadores
   ============================================================ */

const HAS_GSAP = typeof gsap !== 'undefined';
if (!HAS_GSAP) document.documentElement.classList.remove('js');
if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger);

document.getElementById('year').textContent = new Date().getFullYear();

const BASE_PARALLAX = 160;

function heroIntro() {
  gsap.fromTo('.gsap-fade',
    { opacity: 0, y: 22 },
    {
      opacity: 1, y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.09,
      delay: 0.12,
    });
}

function parallaxLayers() {
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || 0;
    gsap.fromTo(el, { y: -speed * BASE_PARALLAX }, {
      y: speed * BASE_PARALLAX,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section, header') || el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

function headings() {
  gsap.utils.toArray('.section-title, .section-sub').forEach((el) => {
    gsap.from(el, {
      opacity: 0, y: 20, duration: 0.6, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });
}

function revealAll() {
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 18 }, {
      opacity: 1, y: 0, duration: 0.55, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });
}

function imageJourney() {
  gsap.utils.toArray('.mod__shot img, .story-scenes__media img').forEach((img) => {
    gsap.fromTo(img,
      { yPercent: -6, scale: 1.1 },
      {
        yPercent: 6,
        scale: 1.02,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.mod__media, .story-scenes__media') || img,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      });
  });

  // Cards de mockups (reveal suave)
  gsap.utils.toArray('.story-scenes__card').forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 85%' },
        delay: i * 0.05,
      });
  });

  gsap.utils.toArray('.mod').forEach((mod) => {
    const text = mod.querySelector('.mod__text');
    const media = mod.querySelector('.mod__media, .map-sim');
    if (!text) return;
    const fromX = mod.classList.contains('mod--rev') ? 28 : -28;
    gsap.fromTo(text,
      { opacity: 0, x: fromX },
      {
        opacity: 1, x: 0, duration: 0.65, ease: 'power3.out',
        scrollTrigger: { trigger: mod, start: 'top 78%' },
      });
    if (media && !media.id) {
      gsap.fromTo(media,
        { opacity: 0, y: 36, rotate: mod.classList.contains('mod--rev') ? -1.2 : 1.2 },
        {
          opacity: 1, y: 0, rotate: 0, duration: 0.75, ease: 'power3.out',
          scrollTrigger: { trigger: mod, start: 'top 78%' },
        });
    }
  });
}

function mapSimAnimation() {
  const map = document.getElementById('mapSim');
  const spots = gsap.utils.toArray('#mapSim .spot');
  if (!map || spots.length < 2) return;

  // Centrado con xPercent/yPercent (no pelear con CSS translate)
  gsap.set(spots, { xPercent: -50, yPercent: -50, y: -56, scale: 0.82, opacity: 0 });

  gsap.to(spots, {
    y: 0,
    scale: 1,
    opacity: 1,
    duration: 0.45,
    ease: 'back.out(1.5)',
    stagger: 0.07,
    scrollTrigger: {
      trigger: map,
      start: 'top 70%',
      once: true,
      invalidateOnRefresh: true,
    },
  });
}

function xTransition(isMobile) {
  const pin = document.querySelector('#transformacion .chaos__pin');
  const chat = document.getElementById('chaosChat');
  const xls = document.getElementById('chaosXls');
  const table = document.getElementById('chaosTable');
  const cap = document.getElementById('chaosCap');
  const sub = document.getElementById('chaosSub');
  if (!pin || !chat || !xls || !table) return;

  const scenes = [
    { title: 'Hoy preguntas', sub: 'Radio o WhatsApp: “¿El D5256 está lleno?”' },
    { title: 'Revisas registros desactualizados', sub: 'El Excel eterno… lleno de dudas y celdas a medias' },
    { title: 'Con MapGestión solo miras', sub: 'D5256: gasolina, km, estado y ubicación — al instante' },
  ];

  const setScene = (i) => {
    if (cap) cap.textContent = scenes[i].title;
    if (sub) sub.textContent = scenes[i].sub;
  };

  gsap.set([chat, xls, table], { opacity: 0, y: isMobile ? 20 : 28, scale: 0.96 });
  gsap.set(chat, { opacity: 1, y: 0, scale: 1 });
  setScene(0);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#transformacion',
      start: 'top top',
      end: isMobile ? '+=260%' : '+=280%',
      scrub: isMobile ? 0.55 : 0.85,
      pin: pin,
      pinType: isMobile ? 'transform' : 'fixed',
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        setScene(p < 0.34 ? 0 : p < 0.67 ? 1 : 2);
      },
    },
  });

  tl.to(chat, { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'none' }, 0)
    .to(chat, { opacity: 0, y: isMobile ? -16 : -28, scale: 0.94, duration: 0.12, ease: 'none' }, 0.28)
    .fromTo(xls,
      { opacity: 0, y: isMobile ? 24 : 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.12, ease: 'none' }, 0.30)
    .to(xls, { opacity: 1, duration: 0.18, ease: 'none' }, 0.42)
    .to(xls, { opacity: 0, y: isMobile ? -16 : -28, scale: 0.93, duration: 0.12, ease: 'none' }, 0.60)
    .fromTo(table,
      { opacity: 0, y: isMobile ? 24 : 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.14, ease: 'none' }, 0.62)
    .to({}, { duration: 0.24 });
}

function counters() {
  gsap.utils.toArray('[data-counter]').forEach((el) => {
    const target = +el.dataset.counter;
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    const o = { v: 0 };
    const tween = gsap.fromTo(o, { v: 0 }, {
      v: target, duration: 1.6, ease: 'power1.out',
      repeat: -1, repeatDelay: 2.4, paused: true,
      onUpdate: () => { el.textContent = pre + Math.round(o.v) + suf; },
    });
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', end: 'bottom 10%',
      onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
    });
  });
}

function formReveal() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  gsap.from(form.querySelectorAll('.cform__field, button'), {
    opacity: 0, y: 18, duration: 0.45, ease: 'power2.out', stagger: 0.07,
    scrollTrigger: { trigger: form, start: 'top 85%' },
  });
}

if (HAS_GSAP) {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    heroIntro();
    headings();
    revealAll();
    formReveal();
    imageJourney();
    counters();
  });

  mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
    parallaxLayers();
    xTransition(false);
    mapSimAnimation();
  });

  mm.add('(max-width: 767px) and (prefers-reduced-motion: no-preference)', () => {
    xTransition(true);
    // Móvil: unidades del mapa caen 1×1 (sin pin)
    const spots = gsap.utils.toArray('#mapSim .spot');
    if (spots.length) {
      gsap.set(spots, { xPercent: -50, yPercent: -50, opacity: 0, y: -36, scale: 0.85 });
      gsap.to(spots, {
        opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.4)',
        stagger: 0.06,
        scrollTrigger: { trigger: '#mapSim', start: 'top 75%', once: true },
      });
    }
  });

  // Mobile navigation toggle
const menuBtn = document.getElementById('menuBtn');
const navDrawer = document.querySelector('.nav__drawer');
const navOverlay = document.getElementById('navOverlay');

function toggleMenu(open) {
  const isOpen = typeof open === 'boolean' ? open : !navDrawer.classList.contains('is-open');
  navDrawer.classList.toggle('is-open', isOpen);
  navOverlay.classList.toggle('is-open', isOpen);
  navDrawer.setAttribute('aria-hidden', !isOpen);
  navOverlay.setAttribute('aria-hidden', !isOpen);
  if (isOpen) {
    menuBtn.setAttribute('aria-label', 'Close navigation');
    // focus first link for accessibility
    const firstLink = navDrawer.querySelector('a');
    firstLink && firstLink.focus();
  } else {
    menuBtn.setAttribute('aria-label', 'Open navigation');
    menuBtn.focus();
  }
}

menuBtn?.addEventListener('click', () => toggleMenu());
navOverlay?.addEventListener('click', () => toggleMenu(false));


}

if (!HAS_GSAP || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.remove('js');
  document.querySelectorAll('[data-counter]').forEach((el) => {
    el.textContent = (el.dataset.prefix || '') + el.dataset.counter + (el.dataset.suffix || '');
  });
}

/* Tabla MapGestión — buscador + filtros */
(function mgTable() {
  const body = document.getElementById('mgBody');
  if (!body) return;
  const search = document.getElementById('mgSearch');
  const filters = document.getElementById('mgFilters');
  const countEl = document.getElementById('mgCount');

  const COLORS = { LISTO: '#34d399', PREPARACION: '#fbbf24', TALLER: '#f87171', PATIO: '#38bdf8' };
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
