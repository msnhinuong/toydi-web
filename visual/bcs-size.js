/* Visual essay: chọn size bao cao su – vẽ biểu đồ & máy tính size (SVG thuần, không thư viện) */
(() => {
  const root = document.querySelector('.ve'); if (!root) return;
  const R = root.dataset.root || '../../';
  let D = []; try { D = JSON.parse(document.getElementById('ve-data').textContent); } catch (e) { return; }
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const cm = (v) => String(+v.toFixed(1)).replace('.', ',');
  const vnd = (n) => Math.round(n).toLocaleString('vi-VN') + 'đ';
  const BRAND = { Sagami: '#702B49', Okamoto: '#173F4B', PlayAh: '#D67A91', Kimono: '#B08A3E', CARE: '#5A7BA8' };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const track = (n, p) => { try { window.tdTrack && window.tdTrack(n, p); } catch (e) {} };

  const tipFor = (box) => { const t = document.createElement('div'); t.className = 've-tip'; t.hidden = true; box.appendChild(t); return t; };
  const showTip = (box, tip, svg, x, y, text) => {
    const s = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    tip.textContent = text; tip.hidden = false;
    tip.style.left = Math.max(60, Math.min(box.clientWidth - 60, x * s)) + 'px'; tip.style.top = (y * s) + 'px';
  };
  const clip = (svg, id, r) => { const defs = svg.querySelector('defs') || el('defs', {}, svg); const c = el('clipPath', { id }, defs); el('circle', { cx: 0, cy: 0, r }, c); };

  /* 1) Biểu đồ chấm theo chiều rộng: mỗi chấm là ảnh sản phẩm */
  const strip = root.querySelector('[data-chart="strip"]');
  let setMode = () => {};
  if (strip) {
    const widths = [...new Set(D.map((d) => d.w))].sort((a, b) => a - b);
    const cols = 5, r = 23, gap = 54, pad = 34;
    const groups = widths.map((w) => ({ w, L: D.filter((d) => d.w === w) }));
    groups.forEach((g) => { g.n = Math.min(cols, g.L.length); g.bw = Math.max(g.n * gap, 96) + pad; });
    const W = groups.reduce((s, g) => s + g.bw, 0) + 20;
    const rows = Math.max(...groups.map((g) => Math.ceil(g.L.length / cols)));
    const H = 30 + rows * gap + 74;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, strip); clip(svg, 'veC', r);
    const tip = tipFor(strip);
    let x0 = 10;
    groups.forEach(({ w, L, n, bw }) => {
      const cx = x0 + bw / 2; x0 += bw;
      el('line', { x1: cx - bw / 2 + 10, x2: cx + bw / 2 - 10, y1: H - 48, y2: H - 48, stroke: '#101F33', 'stroke-opacity': .25 }, svg);
      const t = el('text', { x: cx, y: H - 22, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 600, fill: '#101F33' }, svg); t.textContent = cm(w) + ' cm';
      const c = el('text', { x: cx, y: H - 3, 'text-anchor': 'middle', 'font-size': 14, fill: '#5A5560' }, svg); c.textContent = L.length + ' loại';
      L.forEach((d, k) => {
        const col = k % cols, row = Math.floor(k / cols);
        const x = cx + (col - (n - 1) / 2) * gap, y = H - 48 - r - 8 - row * gap;
        const g = el('g', { class: 've-dot', transform: `translate(${x},${y})`, 'data-w': w, tabindex: 0 }, svg);
        el('circle', { r: r + 2.5, fill: '#fff', stroke: BRAND[d.brand] || '#101F33', 'stroke-width': 2.5 }, g);
        const im = el('image', { href: R + d.img, x: -r, y: -r, width: 2 * r, height: 2 * r, 'clip-path': 'url(#veC)', preserveAspectRatio: 'xMidYMid slice' }, g);
        const txt = `${d.name} · ${cm(d.w)} cm`;
        const on = () => showTip(strip, tip, svg, x, y - r, txt);
        g.addEventListener('pointerenter', on); g.addEventListener('focus', on);
        g.addEventListener('pointerleave', () => { tip.hidden = true; }); g.addEventListener('blur', () => { tip.hidden = true; });
        g.addEventListener('click', () => { on(); track('visual_tap', { chart: 'width', product: d.slug }); });
        im.setAttribute('aria-label', txt);
      });
    });
    const dots = [...svg.querySelectorAll('.ve-dot')];
    setMode = (m) => dots.forEach((g) => {
      const w = +g.dataset.w;
      const keep = m === 'all' || (m === 'std' && w === 5.2) || (m === 'snug' && w < 5.2) || (m === 'big' && w > 5.2);
      g.classList.toggle('dim', !keep);
    });
  }

  /* bước cuộn */
  const steps = [...root.querySelectorAll('.ve-step')];
  if (steps.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      steps.forEach((s) => s.classList.toggle('on', s === en.target));
      setMode(en.target.dataset.step);
    }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));
  }
  setMode('all');

  /* 2) Minh họa trải phẳng → chu vi */
  const flat = root.querySelector('[data-chart="flat"]');
  if (flat) {
    const svg = el('svg', { viewBox: '0 0 520 300' }, flat);
    const g1 = el('g', { transform: 'translate(40,40)' }, svg);
    el('path', { d: 'M0 30 Q0 0 30 0 L150 0 Q180 0 180 30 L180 200 L0 200 Z', fill: '#fff', stroke: '#702B49', 'stroke-width': 3 }, g1);
    el('rect', { x: 70, y: -22, width: 40, height: 26, rx: 13, fill: '#fff', stroke: '#702B49', 'stroke-width': 3 }, g1);
    el('line', { x1: 0, x2: 180, y1: 232, y2: 232, stroke: '#101F33', 'stroke-width': 2, 'marker-start': 'url(#veA)', 'marker-end': 'url(#veA)' }, g1);
    const defs = el('defs', {}, svg); const mk = el('marker', { id: 'veA', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs); el('path', { d: 'M0 0 L10 5 L0 10 z', fill: '#101F33' }, mk);
    const t1 = el('text', { x: 90, y: 258, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: '#101F33' }, g1); t1.textContent = 'rộng 5,2 cm';
    const arr = el('text', { x: 268, y: 150, 'text-anchor': 'middle', 'font-size': 34, fill: '#702B49' }, svg); arr.textContent = '→';
    const circ = el('circle', { cx: 410, cy: 140, r: 66, fill: 'none', stroke: '#702B49', 'stroke-width': 3 }, svg);
    const t2 = el('text', { x: 410, y: 146, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#101F33' }, svg); t2.textContent = 'chu vi 10,4 cm';
    const t3 = el('text', { x: 410, y: 240, 'text-anchor': 'middle', 'font-size': 14, fill: '#5A5560' }, svg); t3.textContent = '= 2 × 5,2 cm, khi chưa giãn';
    if (!reduce && 'IntersectionObserver' in window) {
      const len = 2 * Math.PI * 66; circ.style.strokeDasharray = len; circ.style.strokeDashoffset = len;
      new IntersectionObserver((es, o) => es.forEach((en) => { if (en.isIntersecting) { circ.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.23,1,.32,1)'; circ.style.strokeDashoffset = 0; o.disconnect(); } }), { threshold: .5 }).observe(flat);
    }
  }

  /* 3) Máy tính size */
  const range = root.querySelector('#ve-girth');
  if (range) {
    const out = root.querySelector('#ve-out'), ans = root.querySelector('[data-calc="ans"]'), picks = root.querySelector('[data-calc="picks"]'), bandBox = root.querySelector('[data-chart="band"]');
    const W = 520, H = 80, x0 = 4.4, x1 = 6.4, sx = (v) => 16 + (v - x0) / (x1 - x0) * (W - 32);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, bandBox);
    const shade = el('rect', { y: 6, height: 40, rx: 8, fill: '#D67A91', 'fill-opacity': .35, stroke: '#D67A91' }, svg);
    el('line', { x1: 16, x2: W - 16, y1: 46, y2: 46, stroke: '#F1E6E3', 'stroke-opacity': .5 }, svg);
    for (let v = 4.5; v <= 6.31; v += .5) { const t = el('text', { x: sx(v), y: 70, 'text-anchor': 'middle', 'font-size': 13, fill: '#F1E6E3', 'fill-opacity': .75 }, svg); t.textContent = cm(v); }
    const counts = {}; D.forEach((d) => { counts[d.w] = (counts[d.w] || 0) + 1; });
    Object.keys(counts).forEach((w) => { for (let i = 0; i < counts[w]; i++) el('circle', { cx: sx(+w), cy: 40 - i * 1.7, r: 4, fill: '#F1E6E3' }, svg); });
    let last = '';
    const update = () => {
      const g = +range.value, lo = g * .85 / 2, hi = g * .95 / 2;
      out.textContent = cm(g) + ' cm';
      ans.textContent = `Bao rộng khoảng ${cm(lo)}–${cm(hi)} cm sẽ ôm vừa.`;
      shade.setAttribute('x', sx(Math.max(x0, lo))); shade.setAttribute('width', Math.max(4, sx(Math.min(x1, hi)) - sx(Math.max(x0, lo))));
      const all = D.filter((d) => d.w >= lo - 1e-9 && d.w <= hi + 1e-9).sort((a, b) => (a.w - b.w) || ((a.ppc || 1e9) - (b.ppc || 1e9)));
      // tối đa 8 gợi ý, lấy xen kẽ từng chiều rộng để thấy đủ các size
      const groups = [...new Set(all.map((d) => d.w))].map((w) => all.filter((d) => d.w === w));
      const fit = []; for (let i = 0; fit.length < 8 && groups.some((g) => g[i]); i++) groups.forEach((g) => { if (g[i] && fit.length < 8) fit.push(g[i]); });
      fit.sort((a, b) => (a.w - b.w) || ((a.ppc || 1e9) - (b.ppc || 1e9)));
      const key = fit.map((d) => d.slug).join();
      if (key === last) return; last = key;
      picks.replaceChildren();
      if (!fit.length) {
        const p = document.createElement('p'); p.className = 've-none';
        p.textContent = g < 10.5 ? 'Toydi chưa có bao nhỏ hơn 4,9 cm. Thử loại ôm nhất (4,9 cm) hoặc nhắn Toydi để được tư vấn.' : 'Toydi chưa có bao rộng tới mức này. Loại rộng nhất hiện có là 5,8 cm; nhắn Toydi để được tư vấn thêm.';
        picks.appendChild(p); return;
      }
      fit.forEach((d) => {
        const a = document.createElement('a'); a.className = 've-pick'; a.href = `${R}san-pham/${d.slug}/index.html`;
        const im = document.createElement('img'); im.src = R + d.img; im.alt = d.name; im.loading = 'lazy'; im.width = 400; im.height = 400;
        const s = document.createElement('span'); s.textContent = d.name;
        const sm = document.createElement('small'); sm.textContent = `Rộng ${cm(d.w)} cm · ${d.ppc ? 'khoảng ' + vnd(d.ppc) + '/chiếc' : vnd(d.price)}`;
        a.append(im, s, sm); picks.appendChild(a);
      });
      if (all.length > fit.length) {
        const more = document.createElement('a'); more.className = 've-more'; more.href = `${R}san-pham/index.html?dm=bcs`;
        more.textContent = `Xem cả ${all.length} loại vừa với bạn trong danh mục bao cao su →`; picks.appendChild(more);
      }
    };
    range.addEventListener('input', update);
    range.addEventListener('change', () => track('size_calc', { girth: range.value }));
    update();
  }

  /* 4) Độ dày × giá mỗi chiếc */
  const pc = root.querySelector('[data-chart="price"]');
  if (pc) {
    const P = D.filter((d) => d.ppc);
    const W = 1000, H = 780, m = { l: 64, r: 24, t: 34, b: 60 }, R0 = 21;
    const TH = [...new Set(P.map((d) => d.t))].sort((a, b) => a - b), bw = (W - m.l - m.r) / TH.length;
    const xs = (v) => m.l + bw * (TH.indexOf(v) + .5), ymax = 80000, ys = (v) => H - m.b - (v / ymax) * (H - m.t - m.b);
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, pc); clip(svg, 'veP', R0 - 2);
    const tip = tipFor(pc);
    for (let v = 0; v <= ymax; v += 20000) {
      el('line', { x1: m.l, x2: W - m.r, y1: ys(v), y2: ys(v), stroke: '#101F33', 'stroke-opacity': .1 }, svg);
      const t = el('text', { x: m.l - 10, y: ys(v) + 5, 'text-anchor': 'end', 'font-size': 16, fill: '#5A5560' }, svg); t.textContent = v ? (v / 1000) + 'k' : '0';
    }
    TH.forEach((v, i) => { if (i) el('line', { x1: m.l + bw * i, x2: m.l + bw * i, y1: m.t, y2: H - m.b, stroke: '#101F33', 'stroke-opacity': .07 }, svg); });
    TH.forEach((v) => { const t = el('text', { x: xs(v), y: H - m.b + 26, 'text-anchor': 'middle', 'font-size': 16, fill: '#5A5560' }, svg); t.textContent = String(v).replace('.', ',') + ' mm'; });
    const xl = el('text', { x: (m.l + W - m.r) / 2, y: H - 8, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 600, fill: '#101F33' }, svg); xl.textContent = 'Độ dày — mỏng hơn ở bên trái';
    const yl = el('text', { x: m.l, y: m.t - 14, 'font-size': 16, 'font-weight': 600, fill: '#101F33' }, svg); yl.textContent = 'đ/chiếc';
    // giữ đúng giá (trục dọc), chỉ đẩy ngang các chấm chồng nhau
    const N = P.map((d) => ({ d, x: xs(d.t), x0: xs(d.t), y: ys(d.ppc) }));
    for (let it = 0; it < 600; it++) {
      for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
        const a = N[i], b = N[j], dx = b.x - a.x, dy = b.y - a.y, min = 2 * R0 + 5;
        if (dx * dx + dy * dy < min * min) { const need = Math.sqrt(Math.max(0, min * min - dy * dy)) - Math.abs(dx); const sgn = dx === 0 ? (i % 2 ? 1 : -1) : Math.sign(dx); a.x -= sgn * need / 2; b.x += sgn * need / 2; }
      }
      N.forEach((n) => { n.x += (n.x0 - n.x) * 0.02; n.x = Math.max(n.x0 - bw / 2 + R0 + 2, Math.min(n.x0 + bw / 2 - R0 - 2, n.x)); });
    }
    N.forEach(({ d, x, x0, y }) => {
      const g = el('g', { class: 've-dot', transform: `translate(${x},${y})`, tabindex: 0 }, svg);
      el('circle', { r: R0 + 2, fill: '#fff', stroke: d.latex ? '#101F33' : '#D67A91', 'stroke-width': 3 }, g);
      el('image', { href: R + d.img, x: -(R0 - 2), y: -(R0 - 2), width: 2 * (R0 - 2), height: 2 * (R0 - 2), 'clip-path': 'url(#veP)', preserveAspectRatio: 'xMidYMid slice' }, g);
      const txt = `${d.name} · ${String(d.t).replace('.', ',')} mm · ${vnd(d.ppc)}/chiếc`;
      const on = () => showTip(pc, tip, svg, x, y - R0 - 2, txt);
      g.addEventListener('pointerenter', on); g.addEventListener('focus', on); g.addEventListener('click', on);
      g.addEventListener('pointerleave', () => { tip.hidden = true; }); g.addEventListener('blur', () => { tip.hidden = true; });
    });
    const lg = el('g', { transform: `translate(${W - m.r - 230},${m.t})` }, svg);
    [['Không latex (PU)', '#D67A91'], ['Có latex / chưa ghi', '#101F33']].forEach(([lab, c], i) => {
      el('circle', { cx: 10, cy: 10 + i * 28, r: 9, fill: '#fff', stroke: c, 'stroke-width': 3 }, lg);
      const t = el('text', { x: 28, y: 16 + i * 28, 'font-size': 16, fill: '#101F33' }, lg); t.textContent = lab;
    });
  }
})();
