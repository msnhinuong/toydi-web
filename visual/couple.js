/* Visual essay kiểu Love Story: lưới 100 người + ngôi nhà ba tầng + thanh tiến độ đọc */
(() => {
  const { root, data, el, steps, track, reduce } = window.VE || {};
  if (!root || !data) return;
  const GAP = Object.fromEntries(data.gap.map(([k, n, v]) => [k, { n, v }]));

  /* lưới 100 "người" kiểu đất sét */
  const grid = (box, k) => {
    const { n, v } = GAP[k];
    if (!box.children.length) for (let i = 0; i < 100; i++) { const c = document.createElement('button'); c.type = 'button'; c.className = 've-clay'; box.append(c); }
    [...box.children].forEach((c, i) => {
      const yes = i < v;
      c.classList.toggle('yes', yes);
      c.style.transitionDelay = reduce ? '0s' : (i * 6) + 'ms';
      c.setAttribute('aria-label', `${n}: người thứ ${i + 1}, ${yes ? 'thường xuyên lên đỉnh' : 'không thường xuyên'}`);
      c.onclick = () => { box.querySelectorAll('.ve-clay.pick').forEach((x) => x.classList.remove('pick')); c.classList.add('pick'); box.dataset.msg = `${n} · người thứ ${i + 1}: ${yes ? 'thường xuyên lên đỉnh' : 'không thường xuyên lên đỉnh'}`; };
    });
  };
  const A = root.querySelector('[data-grid="a"]'), B = root.querySelector('[data-grid="b"]');
  if (A && B) {
    grid(A, 'nam-di-tinh'); grid(B, 'nu-di-tinh');
    const chips = [...root.querySelectorAll('.ve-chip')];
    chips.forEach((c) => c.addEventListener('click', () => {
      chips.forEach((x) => x.setAttribute('aria-pressed', x === c ? 'true' : 'false'));
      grid(B, c.dataset.g);
      root.querySelector('[data-gridn="b"]').textContent = GAP[c.dataset.g].v;
      root.querySelector('[data-gridl="b"]').textContent = GAP[c.dataset.g].n;
      track('gap_pick', { group: c.dataset.g });
    }));
  }

  /* ngôi nhà ba tầng */
  const house = root.querySelector('[data-chart="house"]');
  let setFloor = () => {};
  if (house) {
    const svg = el('svg', { viewBox: '0 0 420 420' }, house);
    const F = [
      el('rect', { x: 40, y: 330, width: 340, height: 60, rx: 6 }, svg),
      el('rect', { x: 70, y: 190, width: 280, height: 140, rx: 4 }, svg),
      el('path', { d: 'M40 192 L210 52 L380 192 Z' }, svg),
    ];
    el('rect', { x: 180, y: 260, width: 60, height: 70, rx: 30, fill: '#101F33', 'fill-opacity': .5 }, svg);
    el('rect', { x: 100, y: 222, width: 50, height: 40, rx: 6, fill: '#101F33', 'fill-opacity': .35 }, svg);
    el('rect', { x: 270, y: 222, width: 50, height: 40, rx: 6, fill: '#101F33', 'fill-opacity': .35 }, svg);
    const L = [['Mở lời', 366], ['Chọn món', 300], ['Lần đầu', 160]];
    const T = L.map(([t, y]) => { const n = el('text', { x: 210, y, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700 }, svg); n.textContent = t; return n; });
    const heart = el('text', { x: 210, y: 128, 'text-anchor': 'middle', 'font-size': 34 }, svg); heart.textContent = '♥';
    setFloor = (k) => {
      const f = +k || 0;
      F.forEach((p, i) => { const on = i < f; p.setAttribute('fill', i === f - 1 ? '#D67A91' : on ? '#F2C9D3' : 'rgba(241,230,227,.08)'); p.setAttribute('stroke', '#F1E6E3'); p.setAttribute('stroke-opacity', on ? 0 : .5); p.setAttribute('stroke-dasharray', on ? '' : '6 6'); p.setAttribute('stroke-width', 2); p.style.transition = 'fill .5s'; });
      T.forEach((t, i) => t.setAttribute('fill', i < f ? '#101F33' : 'rgba(241,230,227,.6)'));
      heart.setAttribute('fill', f >= 3 ? '#D67A91' : 'rgba(241,230,227,.15)');
    };
    setFloor(0);
  }
  steps((s) => setFloor(s));

  /* thanh tiến độ đọc */
  const pr = root.querySelector('.ve-progress');
  if (pr) {
    const bar = pr.querySelector('span'), lab = pr.querySelector('b');
    const up = () => { const r = root.getBoundingClientRect(); const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight))); bar.style.width = p * 100 + '%'; lab.textContent = Math.round(p * 100) + '%'; pr.classList.toggle('on', r.top < 0 && r.bottom > innerHeight * .5); };
    addEventListener('scroll', up, { passive: true }); up();
  }
})();
