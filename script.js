document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Smooth scroll
  document.querySelectorAll('.nav-link').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Active link on scroll
  const sections = Array.from(document.querySelectorAll('main .section'));
  const links = Array.from(document.querySelectorAll('.side-nav .nav-link'));
  function setActive() {
    const pos = window.scrollY + 120;
    let current = sections[0]?.id;
    for (const s of sections) {
      if (s.offsetTop <= pos) current = s.id;
    }
    links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${current}`));
  }
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  // Reveal on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('reveal'); });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.section, .card').forEach((el) => observer.observe(el));
});