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
    const scrollBottom = window.scrollY + window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const atBottom = Math.abs(scrollBottom - docHeight) < 2; // near bottom
    let current = sections[0]?.id;
    if (atBottom) {
      current = sections[sections.length - 1]?.id;
    } else {
      const pos = window.scrollY + 140; // offset for rail
      for (const s of sections) {
        if (s.offsetTop <= pos) current = s.id;
      }
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