document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const output = document.getElementById('terminalOutput');
  const toggle = document.getElementById('staticToggle');
  if (!output || !toggle) return;

  const lines = [
    'Welcome to my portfolio. Type `help` for options.',
    '',
    'course',
    'Stanford EE/CS — interests: systems, infra, ML, and tooling.',
    'Prereqs: solid systems background. Security recommended.',
    '',
    'guest_speakers',
    'Weekly talks from builders and researchers working at scale.',
    '',
    "Try: 'experience' or 'projects'",
  ];

  let staticMode = false;

  function typeLine(line, onDone) {
    let i = 0;
    const interval = setInterval(() => {
      if (staticMode) { clearInterval(interval); return; }
      output.textContent += line.charAt(i);
      i += 1;
      if (i >= line.length) {
        clearInterval(interval);
        output.textContent += '\n';
        setTimeout(onDone, 140);
      }
    }, 18);
  }

  function typeLines(list, idx = 0) {
    if (staticMode) return;
    if (idx >= list.length) return;
    typeLine(list[idx], () => typeLines(list, idx + 1));
  }

  function renderStatic() {
    output.textContent = lines.join('\n');
  }

  toggle.addEventListener('click', () => {
    staticMode = !staticMode;
    toggle.textContent = staticMode ? 'Interactive Mode' : 'Static Mode';
    if (staticMode) {
      renderStatic();
    } else {
      output.textContent = '';
      typeLines(lines);
    }
  });

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (ev) => {
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#' || hash === '#top') return;
      const target = document.querySelector(hash);
      if (target) {
        ev.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Start interactive typing by default
  output.textContent = '';
  typeLines(lines);
});


