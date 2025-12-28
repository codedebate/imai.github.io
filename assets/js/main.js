// Shared helper: header height (used across modules)
const getHeaderHeight = () =>
  document.querySelector('header')?.offsetHeight ||
  parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) ||
  64;

// Shared helper: robust vertical scroll position
const getScrollY = () =>
  typeof window.pageYOffset === 'number'
    ? window.pageYOffset
    : (typeof window.scrollY === 'number'
        ? window.scrollY
        : (document.documentElement?.scrollTop || document.body?.scrollTop || 0));

// Year injection (avoid optional chaining on assignment)
(function() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

// Smooth scroll with header offset + focus management
(function() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    if (a.getAttribute('href') === '#') return;
    a.addEventListener('click', function(e) {
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - getHeaderHeight() - 8;
      window.scrollTo({ top: Math.max(0, Math.floor(top)), behavior: prefersReduced ? 'auto' : 'smooth' });
      const focusDelay = prefersReduced ? 0 : 350;
      setTimeout(() => {
        target.setAttribute('tabindex','-1');
        target.focus({ preventScroll: true });
      }, focusDelay);
    });
  });
})();

// IntersectionObserver to highlight active nav links
(function() {
  const links = Array.from(document.querySelectorAll('.nav-links a'));
  const sections = links.map(l => document.getElementById(l.getAttribute('href')?.slice(1))).filter(Boolean);
  if (!sections.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        link.setAttribute('aria-current','true');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }, { rootMargin: `-${Math.round(getHeaderHeight())}px 0px 0px 0px`, threshold: 0.25 });

  sections.forEach(s => obs.observe(s));
})();


  // Back to Top floating link logic
  (function() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    const showAt = 100; // px, lowered to improve discoverability
    const updateVisibility = () => {
      const pageIsScrollable = (document.documentElement.scrollHeight - window.innerHeight) > 48;
      const shouldShow = (getScrollY() > showAt) || !pageIsScrollable; // also show on short pages
      backToTop.classList.toggle('is-visible', shouldShow);
    };
    // Initial check on load
    updateVisibility();
    // Also check after full load (accounts for hash navigation restoring scroll)
    window.addEventListener('load', updateVisibility, { once: true });
    // Also check after DOMContentLoaded, just in case
    document.addEventListener('DOMContentLoaded', updateVisibility, { once: true });
    // Update on scroll
    window.addEventListener('scroll', updateVisibility);
    backToTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();

// FP&A gallery lightbox (robust via event delegation)
(function() {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = '<button class="nav prev" aria-label="Previous">‹</button><img alt="FP&A Agent screenshot" /><button class="nav next" aria-label="Next">›</button><button class="close" aria-label="Close">×</button><div class="counter" aria-live="polite"></div>';
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('img');
  const closeBtn = overlay.querySelector('button.close');
  const prevBtn = overlay.querySelector('button.prev');
  const nextBtn = overlay.querySelector('button.next');
  const counterEl = overlay.querySelector('.counter');
  let currentIndex = -1;

  const getAnchors = () => {
    const gallery = document.getElementById('fpna-gallery');
    return gallery ? Array.from(gallery.querySelectorAll('.gallery-item')) : [];
  };

  const open = (idx) => {
    const anchors = getAnchors();
    if (!anchors.length) return;
    currentIndex = idx;
    const href = anchors[idx]?.getAttribute('href');
    if (!href) return;
    imgEl.src = href;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    counterEl.textContent = (idx + 1) + ' / ' + anchors.length;
    nextBtn.focus();
  };

  const close = () => {
    overlay.classList.remove('open');
    imgEl.removeAttribute('src');
    document.body.style.overflow = '';
  };

  const navigate = (delta) => {
    const anchors = getAnchors();
    if (!anchors.length) return;
    const next = (currentIndex + delta + anchors.length) % anchors.length;
    open(next);
  };

  // Event delegation (capture phase): handle clicks before navigation
  document.addEventListener('click', (e) => {
    const anchor = e.target && (e.target.closest ? e.target.closest('a.gallery-item') : null);
    if (!anchor) return;
    const gallery = document.getElementById('fpna-gallery');
    if (!gallery || !gallery.contains(anchor)) return;
    // Allow open-in-new-tab/window gestures
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    const anchors = getAnchors();
    const idx = anchors.indexOf(anchor);
    open(idx >= 0 ? idx : 0);
  }, true);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', (e) => { e.preventDefault(); navigate(-1); });
  nextBtn.addEventListener('click', (e) => { e.preventDefault(); navigate(1); });
  imgEl.addEventListener('click', () => navigate(1));

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'ArrowLeft') navigate(-1);
  });
})();
