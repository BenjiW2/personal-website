// Cultural Diary scrapbook: lightbox, entrance animation, side-tab highlight.
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  if (!/[?&]draft\b/.test(location.search)) root.classList.add('final'); // pink draft notes only show with ?draft

  // Lightbox
  var box = document.getElementById('lightbox');
  var boxImg = box.querySelector('img');
  var boxCap = box.querySelector('p');
  document.querySelectorAll('.polaroid button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      var cap = btn.parentElement.querySelector('figcaption');
      boxImg.src = img.currentSrc || img.src;
      boxImg.alt = img.alt;
      boxCap.textContent = cap ? cap.textContent : '';
      box.showModal();
    });
  });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });

  // Photo stacks follow the reader down the page. A stack taller than the
  // window sticks by its bottom edge instead of its top, so nothing is cut off.
  function setStick() {
    document.querySelectorAll('.photos').forEach(function (el) {
      el.style.setProperty('--stick', Math.min(24, window.innerHeight - el.offsetHeight - 24) + 'px');
    });
  }
  setStick();
  window.addEventListener('resize', setStick);
  window.addEventListener('load', setStick);

  // Scraps drop onto the page as they scroll into view
  var drops = document.querySelectorAll('.drop');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    drops.forEach(function (el, i) { el.style.setProperty('--d', (i % 4) * 70 + 'ms'); io.observe(el); });
    window.addEventListener('beforeprint', function () { drops.forEach(function (el) { el.classList.add('in'); }); });

    // Highlight the current entry's side tab
    var tabs = {};
    document.querySelectorAll('.tabs a').forEach(function (a) { tabs[a.getAttribute('href').slice(1)] = a; });
    var cur = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var t = tabs[en.target.id];
        if (t && en.isIntersecting) {
          Object.keys(tabs).forEach(function (k) { tabs[k].classList.remove('on'); });
          t.classList.add('on');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('.entry[id]').forEach(function (s) { cur.observe(s); });
  } else {
    drops.forEach(function (el) { el.classList.add('in'); });
  }
})();
