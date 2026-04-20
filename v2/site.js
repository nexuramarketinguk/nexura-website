// =================================================================
// NEXURA v2 — premium interactivity
// =================================================================

// -- Nav: scroll state + mobile toggle ------------------------------
const nav = document.getElementById('nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}

// -- Smooth anchor scroll -------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// -- Reveal on scroll -----------------------------------------------
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// -- Ticker: pause on hover -----------------------------------------
document.querySelectorAll('.ticker').forEach(m => {
  const track = m.querySelector('.ticker-track');
  if (!track) return;
  m.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
  m.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
});

// -- Cinematic hero: mouse parallax on bg + cursor spotlight --------
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.hero-cinematic').forEach(hero => {
  const bg = hero.querySelector('.hero-cinematic-bg');
  const spot = hero.querySelector('.hero-cinematic-spot');

  if (prefersReduced) return;

  let rafId = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  const onMove = (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    // Spotlight follows cursor directly
    if (spot) {
      spot.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      spot.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    }
    // Parallax target (small range)
    targetX = (x - 0.5) * -16;
    targetY = (y - 0.5) * -10;
    if (!rafId) rafId = requestAnimationFrame(update);
  };

  const update = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    if (bg) bg.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      rafId = requestAnimationFrame(update);
    } else {
      rafId = null;
    }
  };

  hero.addEventListener('mousemove', onMove);
  hero.addEventListener('mouseleave', () => {
    targetX = 0; targetY = 0;
    if (!rafId) rafId = requestAnimationFrame(update);
  });
});

// -- Scroll-linked parallax on feature/split images -----------------
const bgImgs = document.querySelectorAll('.feature-bg img, .split-image img');
let scrollTicking = false;
const onScrollParallax = () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    bgImgs.forEach(img => {
      const frame = img.closest('section, figure');
      if (!frame) return;
      const r = frame.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const progress = (vh - r.top) / (vh + r.height);
      const shift = (progress - 0.5) * 36;
      const baseScale = img.closest('.split-image') ? 1 : 1.06;
      img.style.transform = `scale(${baseScale}) translate3d(0, ${shift.toFixed(1)}px, 0)`;
    });
    scrollTicking = false;
  });
};
window.addEventListener('scroll', onScrollParallax, { passive: true });

// -- Magnetic buttons: cursor-tracked radial glow + micro-pull ------
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 100;
    const my = ((e.clientY - r.top) / r.height) * 100;
    btn.style.setProperty('--mx', `${mx}%`);
    btn.style.setProperty('--my', `${my}%`);
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.setProperty('--mx', `50%`);
    btn.style.setProperty('--my', `50%`);
  });
});

// -- WhatsApp chat: sequential bubble reveal when section enters ---
const chatIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const thread = e.target;
    const msgs = thread.querySelectorAll('.wa-msg, .wa-typing');
    msgs.forEach(m => {
      const delay = parseInt(m.dataset.delay || 0, 10);
      setTimeout(() => m.classList.add('show'), delay);
    });
    // Surface floating badges a bit later
    const stage = thread.closest('.phone-stage');
    if (stage) {
      const badges = stage.querySelectorAll('.phone-badge');
      badges.forEach((b, i) => {
        setTimeout(() => b.classList.add('show'), 1600 + i * 600);
      });
    }
    chatIO.unobserve(thread);
  });
}, { threshold: 0.35 });
document.querySelectorAll('.wa-thread').forEach(el => chatIO.observe(el));

// -- 3D tilt on bento cards ----------------------------------------
document.querySelectorAll('.bento-card').forEach(card => {
  if (prefersReduced) return;
  const threshold = 6;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--rx', `${(y * -threshold).toFixed(2)}deg`);
    card.style.setProperty('--ry', `${(x * threshold).toFixed(2)}deg`);
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
});

// -- Count-up spec numbers ------------------------------------------
const countIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const duration = 1300;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = prefix + val;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));
