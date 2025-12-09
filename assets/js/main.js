// Year injection
document.getElementById('year')?.textContent = new Date().getFullYear();

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
