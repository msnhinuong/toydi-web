/* Visual essay: chọn gel theo tình huống */
(() => {
  const root = document.querySelector('.ve'); if (!root) return;
  const chips = [...root.querySelectorAll('.ve-chip')], rows = [...root.querySelectorAll('.ve-matrix tbody tr')];
  const pick = (k) => {
    chips.forEach((c) => c.setAttribute('aria-pressed', c.dataset.sit === k ? 'true' : 'false'));
    rows.forEach((r) => r.classList.toggle('on', r.dataset.sit === k));
    root.querySelector('.ve-matrix').classList.add('picked');
  };
  chips.forEach((c) => c.addEventListener('click', () => { pick(c.dataset.sit); window.VE && VE.track('gel_pick', { sit: c.dataset.sit }); }));
  if (chips[0]) pick(chips[0].dataset.sit);
  const bars = root.querySelector('.ve-bars');
  if (bars && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bars.classList.add('pre');
    new IntersectionObserver((es, o) => es.forEach((en) => { if (en.isIntersecting) { bars.classList.remove('pre'); o.disconnect(); } }), { threshold: .4 }).observe(bars);
  }
})();
