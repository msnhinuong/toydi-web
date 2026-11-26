/* Visual essay kiểu K-pop generations: biểu đồ chấm theo thế hệ + quiz */
(() => {
  const { root, data, el, tipFor, clip, dot, card, vnd, track } = window.VE || {};
  if (!root || !data) return;
  const G = data.gens;
  const box = root.querySelector('[data-chart="gens"]');
  if (box) {
    const seen = new Set();
    G.forEach((g) => { g.own = g.items.filter((d) => !seen.has(d.slug)); g.own.forEach((d) => seen.add(d.slug)); });
    const cols = 3, r = 24, gap = 56, bw = cols * gap + 40, W = G.length * bw + 20;
    const rows = Math.max(...G.map((g) => Math.ceil(g.own.length / cols)));
    const H = 30 + rows * gap + 86;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, box); clip(svg, 'veK', r);
    const tip = tipFor(box);
    G.forEach((g, i) => {
      const cx = 10 + bw * (i + .5);
      el('line', { x1: cx - bw / 2 + 12, x2: cx + bw / 2 - 12, y1: H - 62, y2: H - 62, stroke: g.color, 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
      const b = el('text', { x: cx, y: H - 34, 'text-anchor': 'middle', 'font-size': 19, 'font-weight': 700, fill: '#101F33' }, svg); b.textContent = `Thế hệ ${g.n}`;
      const n = el('text', { x: cx, y: H - 12, 'text-anchor': 'middle', 'font-size': 15, fill: '#5A5560' }, svg); n.textContent = `${g.name} · ${g.own.length} món`;
      const k = Math.min(cols, g.own.length);
      g.own.forEach((d, j) => {
        const x = cx + ((j % cols) - (k - 1) / 2) * gap, y = H - 62 - r - 10 - Math.floor(j / cols) * gap;
        dot(svg, { x, y, r, img: d.img, ring: g.color, clipId: 'veK', label: `${d.name} · ${vnd(d.price)}`, box, tip, onTap: () => track('visual_tap', { chart: 'gens', product: d.slug }) });
      });
    });
  }

  /* quiz: cộng điểm theo thế hệ */
  const form = root.querySelector('[data-chart="quiz"]');
  if (form) {
    const res = form.querySelector('[data-quiz="res"]');
    form.addEventListener('change', () => {
      const picked = [...form.querySelectorAll('input:checked')];
      if (picked.length < form.querySelectorAll('fieldset').length) { res.replaceChildren(); const p = document.createElement('p'); p.textContent = `Còn ${form.querySelectorAll('fieldset').length - picked.length} câu nữa…`; res.append(p); return; }
      const score = {}; picked.forEach((i) => i.value.split(',').forEach((n) => { score[n] = (score[n] || 0) + 1; }));
      const best = +Object.keys(score).sort((a, b) => score[b] - score[a] || a - b)[0];
      const g = G.find((x) => x.n === best);
      res.replaceChildren();
      const h = document.createElement('p'); h.className = 've-qhead'; h.style.setProperty('--gc', g.color);
      const b = document.createElement('b'); b.textContent = `Thế hệ ${g.n} · ${g.name}`; h.append('Bạn hợp với ', b);
      const a = document.createElement('a'); a.className = 'plink'; a.href = `#the-he-${g.n}`; a.textContent = 'Đọc lại chương này ↑';
      const grid = document.createElement('div'); grid.className = 've-picks';
      g.items.slice(0, 4).forEach((d) => grid.append(card(d, vnd(d.price))));
      res.append(h, a, grid);
      track('gen_quiz', { gen: g.n });
    });
  }
})();
