/* Visual essay: thang độ ồn */
(() => {
  const { root, data, el, vnd, track, tipFor, clip, dot, steps, card } = window.VE || {};
  if (!root || !data) return;
  const D = data.items, REFS = data.refs;
  const box = root.querySelector('[data-chart="noise"]');
  let setMode = () => {};
  if (box) {
    const r = 25, gap = 55, cols = 1, lo = 27.5, hi = 72.5, m = { l: 10, r: 10 }, W = m.l + m.r + ((hi - lo) / 5) * (gap + 22);
    const xs = (v) => m.l + (v - lo) / (hi - lo) * (W - m.l - m.r);
    const vals = [...new Set(D.map((d) => d.db))].sort((a, b) => a - b);
    const rows = Math.max(...vals.map((v) => Math.ceil(D.filter((d) => d.db === v).length / cols)));
    const base = 30 + rows * gap + 10, H = base + 104;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, box); clip(svg, 'veN', r);
    const tip = tipFor(box);
    // nền chuyển màu êm → ồn
    const defs = svg.querySelector('defs'); const lg = el('linearGradient', { id: 'veG' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#7FB6A4' }, lg); el('stop', { offset: '55%', 'stop-color': '#E9C77B' }, lg); el('stop', { offset: '100%', 'stop-color': '#D67A91' }, lg);
    el('rect', { x: m.l, y: base, width: W - m.l - m.r, height: 10, rx: 5, fill: 'url(#veG)' }, svg);
    const refG = el('g', { class: 've-refs' }, svg);
    REFS.forEach(([v, lab]) => {
      el('line', { x1: xs(v), x2: xs(v), y1: 18, y2: base + 14, stroke: '#101F33', 'stroke-opacity': .14, 'stroke-dasharray': '4 4' }, refG);
      const t = el('text', { x: xs(v), y: base + 38, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: '#101F33' }, refG); t.textContent = v + ' dB';
      const words = lab.split(', '); words.forEach((w, i) => { const s = el('text', { x: xs(v), y: base + 64 + i * 20, 'text-anchor': 'middle', 'font-size': 16, fill: '#5A5560' }, refG); s.textContent = w; });
    });
    const dots = [];
    vals.forEach((v) => {
      const L = D.filter((d) => d.db === v), n = Math.min(cols, L.length);
      L.forEach((d, k) => {
        const x = xs(v) + ((k % cols) - (n - 1) / 2) * gap, y = base - r - 10 - Math.floor(k / cols) * gap;
        const g = dot(svg, { x, y, r, img: d.img, ring: v <= 45 ? '#2F7D66' : v >= 55 ? '#D67A91' : '#101F33', clipId: 'veN', label: `${d.name} · tối đa ${d.db} dB`, box, tip, onTap: () => track('visual_tap', { chart: 'noise', product: d.slug }) });
        g.dataset.db = v; dots.push(g);
      });
    });
    setMode = (mode) => {
      refG.style.opacity = mode === 'refs' ? 1 : .55;
      dots.forEach((g) => { const v = +g.dataset.db; g.classList.toggle('dim', mode === 'refs' || (mode === 'quiet' && v > 45) || (mode === 'loud' && v < 55)); });
    };
  }
  steps((s) => setMode(s));

  const range = root.querySelector('#ve-db');
  if (range) {
    const out = root.querySelector('#ve-dbout'), ans = root.querySelector('[data-calc="dbans"]'), ref = root.querySelector('[data-calc="dbref"]'), picks = root.querySelector('[data-calc="dbpicks"]');
    let last = '';
    const update = () => {
      const v = +range.value; out.textContent = v + ' dB';
      const fit = D.filter((d) => d.db <= v).sort((a, b) => a.db - b.db || a.price - b.price);
      ans.textContent = fit.length ? `${fit.length} món êm từ ${v} dB trở xuống.` : `Chưa có món nào ghi độ ồn dưới ${v} dB.`;
      const near = REFS.reduce((a, b) => (Math.abs(b[0] - v) < Math.abs(a[0] - v) ? b : a));
      ref.textContent = `${v} dB: gần với ${near[1].toLowerCase()} (${near[0]} dB).`;
      const key = fit.map((d) => d.slug).join(); if (key === last) return; last = key;
      picks.replaceChildren(...fit.map((d) => card(d, `Tối đa ${d.db} dB · ${vnd(d.price)}`)));
    };
    range.addEventListener('input', update);
    range.addEventListener('change', () => track('noise_filter', { db: range.value }));
    update();
  }
})();
