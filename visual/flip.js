/* Visual essay kiểu Flipbook: sách lật nét vẽ tay về vệ sinh đồ chơi */
(() => {
  const V = window.VE; if (!V || !V.data) return;
  const root = V.root, ST = V.data.steps, PER = 6, N = ST.length * PER;
  const q = (k) => root.querySelector(`[data-fb="${k}"]`);
  const rng = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* nét vẽ tay: mỗi khung rung nhẹ khác nhau */
  let R = rng(1);
  const wob = (pts, closed, amp = 1.6) => {
    const p = pts.map(([x, y]) => [x + (R() - 0.5) * amp * 2, y + (R() - 0.5) * amp * 2]);
    let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 1; i < p.length; i++) { const a = p[i - 1], b = p[i]; d += `Q${a[0].toFixed(1)} ${a[1].toFixed(1)} ${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2).toFixed(1)}`; }
    const l = p[p.length - 1]; d += `L${l[0].toFixed(1)} ${l[1].toFixed(1)}`;
    return d + (closed ? 'Z' : '');
  };
  const circ = (cx, cy, r, n = 18) => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(i / n * 6.283) * r, cy + Math.sin(i / n * 6.283) * r]);
  const line = (x1, y1, x2, y2, n = 6) => Array.from({ length: n + 1 }, (_, i) => [x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n]);
  const capsule = (cx, cy, w, h) => {
    const r = h / 2, pts = [];
    for (let i = 0; i <= 10; i++) pts.push([cx - w / 2 + r + (w - 2 * r) * i / 10, cy - r]);
    for (let i = 1; i <= 12; i++) { const a = -Math.PI / 2 + Math.PI * i / 12; pts.push([cx + w / 2 - r + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    for (let i = 1; i <= 10; i++) pts.push([cx + w / 2 - r - (w - 2 * r) * i / 10, cy + r]);
    for (let i = 1; i <= 12; i++) { const a = Math.PI / 2 + Math.PI * i / 12; pts.push([cx - w / 2 + r + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return pts;
  };
  const P = (g, d, cls = 'fb-ink', extra = {}) => V.el('path', Object.assign({ d, class: cls }, extra), g);
  const T = (g, x, y, t, cls = 'fb-txt') => { const n = V.el('text', { x, y, class: cls }, g); n.textContent = t; return n; };

  const TOY = [200, 178, 190, 58];
  const toy = (g, opts = {}) => {
    P(g, wob(capsule(...TOY), true), 'fb-ink fb-toy' + (opts.wet ? ' wet' : ''));
    P(g, wob(line(160, 160, 160, 196, 3), false), 'fb-ink thin');
    P(g, wob(circ(130, 178, 6, 10), true), 'fb-ink thin'); P(g, wob(circ(130, 178, 1.5, 6), true), 'fb-ink thin');
    P(g, wob([[292, 172], [298, 172], [298, 184], [292, 184]], false), 'fb-ink thin');
  };
  const drop = (g, x, y, s = 1) => P(g, wob([[x, y - 9 * s], [x + 5 * s, y], [x + 4 * s, y + 4 * s], [x, y + 6 * s], [x - 4 * s, y + 4 * s], [x - 5 * s, y], [x, y - 9 * s]], true, 0.6), 'fb-ink fb-drop');

  const SCENES = [
    (g, u) => { /* tắt, rút sạc */
      toy(g);
      const px = 300 + u * 70; P(g, wob([[px, 178], [px + 30, 178], [px + 60, 200], [px + 90, 230], [400, 240]], false), 'fb-ink thin');
      P(g, wob([[px, 170], [px + 16, 170], [px + 16, 186], [px, 186]], true), 'fb-ink');
      if (u < 0.6) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => P(g, wob(line(200 + sx * 108, 178 + sy * 36, 200 + sx * 122, 178 + sy * 48, 2), false), 'fb-ink thin', { opacity: 1 - u / 0.6 }));
      T(g, 200, 268, u > 0.5 ? 'TẮT' : 'BẬT', 'fb-txt big');
    },
    (g, u, w) => { /* có chống nước không */
      toy(g);
      const s = Math.min(1, u * 1.6), cy = 82;
      P(g, wob(circ(200, cy, 38 * s, 20), true), 'fb-ink fb-badge');
      if (s > 0.6) { T(g, 200, cy + 7, w ? 'IPX7' : 'không', 'fb-txt big'); if (!w) T(g, 200, cy + 26, 'chống nước', 'fb-txt'); }
      P(g, wob(line(200, cy + 40 * s, 200, 140, 3), false), 'fb-ink thin');
    },
    (g, u, w) => { /* rửa vòi / lau khăn ẩm */
      toy(g, { wet: true });
      if (w) {
        P(g, wob([[150, 20], [230, 20], [230, 44], [214, 44], [214, 62], [200, 62], [200, 44], [150, 44]], true), 'fb-ink');
        for (let k = 0; k < 7; k++) { const y = 72 + ((u * 60 + k * 17) % 76); drop(g, 200 + ((k % 3) - 1) * 10, y, 0.9); }
      } else {
        const x = 90 + u * 210; P(g, wob([[x - 40, 132], [x + 40, 128], [x + 44, 168], [x - 36, 172]], true), 'fb-ink fb-cloth');
        for (let k = 0; k < 4; k++) P(g, wob(line(x - 30 + k * 18, 140, x - 28 + k * 18, 160, 2), false), 'fb-ink thin');
      }
    },
    (g, u) => { /* xà phòng */
      toy(g, { wet: true });
      const B = [[140, 140, 9], [175, 128, 13], [215, 132, 8], [250, 140, 12], [280, 160, 7], [120, 200, 10], [190, 214, 9], [240, 210, 12], [270, 200, 8], [160, 112, 6], [232, 108, 7]];
      B.slice(0, 4 + Math.round(u * 7)).forEach(([x, y, r], k) => P(g, wob(circ(x, y, r * (0.6 + 0.4 * Math.min(1, u * 2 + k * 0.05)), 12), true, 0.8), 'fb-ink fb-bub'));
    },
    (g, u, w) => { /* xả / tránh cổng */
      toy(g, { wet: w });
      if (w) {
        P(g, wob([[150, 20], [230, 20], [230, 44], [214, 44], [214, 62], [200, 62], [200, 44], [150, 44]], true), 'fb-ink');
        for (let k = 0; k < 7; k++) { const y = 72 + ((u * 60 + k * 17) % 76); drop(g, 200 + ((k % 3) - 1) * 10, y, 0.9); }
        [[150, 140, 8], [255, 145, 9], [130, 205, 7]].forEach(([x, y, r]) => P(g, wob(circ(x, y, r * (1 - u), 10), true, 0.6), 'fb-ink fb-bub'));
      } else {
        const s = 1 + Math.sin(u * 6.283) * 0.08;
        [[130, 178], [295, 178]].forEach(([x, y]) => { P(g, wob(circ(x, y, 22 * s, 16), true), 'fb-ink fb-warn'); P(g, wob(line(x - 12, y - 32, x + 12, y - 52, 2), false), 'fb-ink'); P(g, wob(line(x + 12, y - 32, x - 12, y - 52, 2), false), 'fb-ink'); });
        drop(g, 130, 88 + u * 20, 1); drop(g, 295, 92 + u * 16, 1);
      }
    },
    (g, u) => { /* lau khô */
      toy(g, { wet: u < 0.7 });
      const x = 70 + u * 260; P(g, wob([[x - 34, 120], [x + 34, 116], [x + 38, 240], [x - 30, 244]], true), 'fb-ink fb-towel');
      for (let k = 0; k < 3; k++) P(g, wob(line(x - 30, 140 + k * 40, x + 34, 138 + k * 40, 3), false), 'fb-ink thin');
      [[110, 230], [300, 232], [160, 246]].forEach(([dx, dy]) => { if (dx > x) drop(g, dx, dy, 0.8); });
    },
    (g, u) => { /* để khô */
      toy(g);
      for (let k = 0; k < 3; k++) { const y0 = 130 - u * 50, o = 1 - u * 0.8; P(g, wob([[160 + k * 40, y0], [170 + k * 40, y0 - 14], [160 + k * 40, y0 - 28], [170 + k * 40, y0 - 42]], false), 'fb-ink thin', { opacity: o }); }
      P(g, wob(circ(330, 70, 26, 18), true), 'fb-ink');
      const a = -Math.PI / 2 + u * 6.283; P(g, wob(line(330, 70, 330 + Math.cos(a) * 18, 70 + Math.sin(a) * 18, 2), false), 'fb-ink');
      P(g, wob(line(330, 70, 330, 56, 2), false), 'fb-ink thin');
    },
    (g, u) => { /* túi vải */
      toy(g);
      const top = 260 - u * 150;
      P(g, wob([[88, 262], [92, top], [308, top - 4], [314, 262]], true), 'fb-ink fb-pouch');
      if (u > 0.4) { P(g, wob([[96, top + 14], [200, top + 22], [306, top + 10]], false), 'fb-ink thin'); P(g, wob([[200, top + 22], [192, top + 50], [210, top + 56]], false), 'fb-ink thin'); }
    },
    (g, u) => { /* sạc mỗi 1-2 tháng */
      P(g, wob([[100, 140], [280, 140], [280, 220], [100, 220]], true), 'fb-ink');
      P(g, wob([[280, 164], [294, 164], [294, 196], [280, 196]], true), 'fb-ink');
      const w = 8 + u * 164; P(g, wob([[104, 144], [104 + w, 144], [104 + w, 216], [104, 216]], true, 0.8), 'fb-ink fb-batt');
      P(g, wob([[176, 158], [164, 184], [190, 182], [178, 206]], false), 'fb-ink');
      P(g, wob([[120, 48], [280, 48], [280, 108], [120, 108]], true), 'fb-ink');
      P(g, wob(line(120, 66, 280, 66, 6), false), 'fb-ink thin');
      T(g, 200, 96, '1–2 tháng', 'fb-txt big');
    },
  ];

  /* sách lật */
  const stage = q('stage'), range = q('range'), play = q('play');
  const svg = V.el('svg', { viewBox: '60 14 300 256', role: 'img' }, stage);
  let f = 0, water = true, timer = 0;
  const list = [...q('list').children];
  const draw = () => {
    const s = Math.floor(f / PER), u = (f % PER) / (PER - 1), S = ST[s];
    R = rng(f * 97 + (water ? 0 : 5000));
    svg.innerHTML = ''; const g = V.el('g', {}, svg);
    SCENES[s](g, u, water);
    const t = !water && S.t2 ? S.t2 : S.t, d = !water && S.d2 ? S.d2 : S.d;
    svg.setAttribute('aria-label', `Bước ${s + 1}: ${t}`);
    q('step').textContent = `Bước ${s + 1}/${ST.length}`; q('t').textContent = t; q('d').textContent = d;
    q('n').textContent = String(f + 1).padStart(2, '0'); q('c').textContent = `Khung ${f + 1}/${N}`; range.value = f;
    list.forEach((li, k) => { li.classList.toggle('on', k === s); li.classList.toggle('past', k < s); li.querySelector('span').textContent = !water && ST[k].t2 ? ST[k].t2 : ST[k].t; });
  };
  const stop = () => { clearInterval(timer); timer = 0; play.textContent = '▶ Lật'; };
  const start = () => { if (f >= N - 1) f = 0; play.textContent = '❚❚ Dừng'; timer = setInterval(() => { f++; if (f >= N - 1) { f = N - 1; stop(); } draw(); }, 140); V.track('flip_play', {}); };
  play.addEventListener('click', () => (timer ? stop() : start()));
  range.addEventListener('input', () => { stop(); f = +range.value; draw(); });
  list.forEach((li, k) => { li.tabIndex = 0; const go = () => { stop(); f = k * PER; draw(); }; li.addEventListener('click', go); li.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') go(); }); });
  root.querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => { water = b.dataset.w === '1'; root.querySelectorAll('[data-w]').forEach((x) => x.setAttribute('aria-pressed', x === b)); draw(); }));
  draw();
  /* tự lật một vòng khi cuộn tới lần đầu */
  if ('IntersectionObserver' in window && !V.reduce) new IntersectionObserver((es, o) => es.forEach((en) => { if (en.isIntersecting) { o.disconnect(); start(); } }), { threshold: 0.5 }).observe(stage);

  /* 12 tháng: hai cách chăm */
  const year = q('year');
  [['Chăm sai', 1], ['Chăm đúng', 0]].forEach(([name, bad]) => {
    const row = document.createElement('div'); row.className = 've-yrow';
    const h = document.createElement('p'); h.className = 've-yh'; h.textContent = name; row.append(h);
    for (let m = 1; m <= 12; m++) {
      const c = document.createElement('figure'); c.className = 've-ycell';
      const s = V.el('svg', { viewBox: '95 25 280 190', 'aria-hidden': 'true' }, c); const g = V.el('g', {}, s);
      R = rng(m * 31 + bad * 999);
      toy(g);
      if (bad) {
        const k = Math.floor(m * 1.6); const MR = rng(m * 7);
        for (let i = 0; i < k; i++) { const x = 120 + MR() * 165, y = 160 + MR() * 36; P(g, wob(circ(x, y, 3 + MR() * 4, 8), true, 0.5), 'fb-ink fb-mold'); }
        if (m >= 6) P(g, wob([[170, 207], [172, 230], [176, 214], [182, 240], [188, 207]], false), 'fb-ink fb-sticky');
        if (m >= 9) P(g, wob([[240, 150], [250, 166], [244, 176], [256, 196]], false), 'fb-ink');
      }
      const lvl = bad ? Math.max(0, 1 - m / 7) : 0.9;
      P(g, wob([[300, 30], [370, 30], [370, 62], [300, 62]], true), 'fb-ink');
      if (lvl > 0) P(g, wob([[304, 34], [304 + 62 * lvl, 34], [304 + 62 * lvl, 58], [304, 58]], true, 0.6), 'fb-ink ' + (lvl < 0.3 ? 'fb-low' : 'fb-batt'));
      const cap = document.createElement('figcaption'); cap.textContent = `T${m}`; c.append(cap); row.append(c);
    }
    year.append(row);
  });

  /* dấu hiệu nghỉ hưu */
  const RET = {
    nut: (g) => { P(g, wob([[180, 150], [192, 170], [184, 182], [198, 206]], false), 'fb-ink'); P(g, wob([[230, 152], [238, 168], [232, 178]], false), 'fb-ink'); },
    ro: (g) => { const MR = rng(3); for (let i = 0; i < 16; i++) P(g, wob(circ(115 + MR() * 175, 160 + MR() * 36, 2.5, 6), true, 0.4), 'fb-ink fb-mold'); },
    dinh: (g) => { [150, 200, 250].forEach((x) => P(g, wob([[x, 206], [x + 2, 236], [x + 6, 220], [x + 9, 246], [x + 12, 206]], false), 'fb-ink fb-sticky')); },
    mui: (g) => { [150, 200, 250].forEach((x) => P(g, wob([[x, 140], [x + 10, 124], [x, 108], [x + 10, 92], [x, 76]], false), 'fb-ink')); },
  };
  root.querySelectorAll('[data-ret]').forEach((d) => { R = rng(d.dataset.ret.length * 13); const s = V.el('svg', { viewBox: '60 40 300 230', 'aria-hidden': 'true' }, d); const g = V.el('g', {}, s); toy(g); RET[d.dataset.ret](g); });
})();
