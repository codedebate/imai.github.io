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

// Year injection
document.getElementById('year')?.textContent = new Date().getFullYear();

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
