// Year injection
document.getElementById('year')?.textContent = new Date().getFullYear();

// Mobile menu toggle with improved aria
(function() {
  const btn = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-navigation');
  if (!btn || !nav) return;
  btn.setAttribute('aria-label', 'Toggle navigation menu');
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      nav.style.display = 'flex';
      nav.style.flexDirection = 'column';
      nav.style.position = 'absolute';
      nav.style.top = '100%';
      nav.style.right = '0.5rem';
      nav.style.background = '#fff';
      nav.style.border = '1px solid var(--color-border)';
      nav.style.padding = '0.5rem';
      nav.style.borderRadius = '8px';
      // move focus to first link
      const first = nav.querySelector('a');
      first?.focus();
    } else {
      nav.style.display = '';
      nav.style.flexDirection = '';
      nav.style.position = '';
      nav.style.top = '';
      nav.style.right = '';
      nav.style.background = '';
      nav.style.border = '';
      nav.style.padding = '';
      nav.style.borderRadius = '';
      btn.focus();
    }
  });
})();

// Smooth scroll with header offset + focus management
(function() {
  const headerHeight = () => document.querySelector('header')?.offsetHeight || parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 64;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    if (a.getAttribute('href') === '#') return;
    a.addEventListener('click', function(e) {
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight() - 8;
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
  }, { rootMargin: `-${Math.round(headerHeight())}px 0px 0px 0px`, threshold: 0.25 });

  sections.forEach(s => obs.observe(s));
})();
