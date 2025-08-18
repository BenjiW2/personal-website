document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Smooth scroll for navigation links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offsetTop = target.offsetTop - 80; // Account for sticky nav
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Update active navigation link on scroll
  const sections = document.querySelectorAll('section[id]');
  
  function updateActiveNav() {
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Throttled scroll event listener for performance
  let ticking = false;
  
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll);
  
  // Initial call to set active nav on page load
  updateActiveNav();

  // Add subtle fade-in animation for content
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe sections for fade-in animation
  const animatedElements = document.querySelectorAll('.section, .experience-item, .project-item');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Immediate show for header
  const header = document.querySelector('.header');
  if (header) {
    header.style.opacity = '1';
    header.style.transform = 'translateY(0)';
  }

  // Collapsible lists: initially collapse after 2 items
  function setupCollapsible(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const container = section.closest('[data-collapsible]');
    if (!container) return;
    container.classList.add('is-collapsed');
  }

  setupCollapsible('experience');
  setupCollapsible('projects');

  // Toggle buttons
  document.querySelectorAll('[data-toggle]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-toggle');
        const section = document.getElementById(targetId);
        if (!section) return;
        const container = section.closest('[data-collapsible]');
        if (!container) return;
        const collapsed = container.classList.toggle('is-collapsed');
        btn.textContent = collapsed ? 'Show more' : 'Show less';
      });
    });
});