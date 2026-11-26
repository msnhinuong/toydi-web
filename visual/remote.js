/* Visual essay: tầm điều khiển trên mặt bằng căn hộ */
(() => {
  const { root, data, el, track } = window.VE || {};
  if (!root || !data) return;
  const box = root.querySelector('[data-chart="plan"]'); if (!box) return;
  const S = 50, PW = 12, PH = 9, pad = 20, W = PW * S + 2 * pad, H = PH * S + 2 * pad;
  const X = (m) => pad + m * S, Y = (m) => pad + m * S;
  const ROOMS = [
    ['Phòng khách', 0, 0, 6, 5], ['Bếp', 6, 0, 4, 4], ['Ban công', 10, 0, 2, 4],
    ['Phòng ngủ 1', 0, 5, 5, 4], ['Phòng tắm', 5, 5, 2.5, 4], ['Phòng ngủ 2', 7.5, 4, 4.5, 5],
  ];
  const HOLD = [1.4, 3.9];
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}` }, box);
  const defs = el('defs', {}, svg); const cp = el('clipPath', { id: 'vePlan' }, defs); el('rect', { x: X(0), y: Y(0), width: PW * S, height: PH * S }, cp);
  for (let i = 0; i <= PW; i++) el('line', { x1: X(i), x2: X(i), y1: Y(0), y2: Y(PH), stroke: '#F1E6E3', 'stroke-opacity': .07 }, svg);
  for (let j = 0; j <= PH; j++) el('line', { x1: X(0), x2: X(PW), y1: Y(j), y2: Y(j), stroke: '#F1E6E3', 'stroke-opacity': .07 }, svg);
  const roomEls = ROOMS.map(([name, x, y, w, h]) => {
    const r = el('rect', { x: X(x), y: Y(y), width: w * S, height: h * S, fill: '#F1E6E3', 'fill-opacity': .04, stroke: '#F1E6E3', 'stroke-opacity': .55, 'stroke-width': 3 }, svg);
    const t = el('text', { x: X(x + w / 2), y: Y(y + h / 2) + 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 600, fill: '#F1E6E3' }, svg); t.textContent = name;
    return { name, r, t, cx: x + w / 2, cy: y + h / 2, far: Math.max(...[[x, y], [x + w, y], [x, y + h], [x + w, y + h]].map(([a, b]) => Math.hypot(a - HOLD[0], b - HOLD[1]))) };
  });
  const g = el('g', { 'clip-path': 'url(#vePlan)' }, svg);
  const circ = el('circle', { cx: X(HOLD[0]), cy: Y(HOLD[1]), r: 0, fill: '#D67A91', 'fill-opacity': .22, stroke: '#D67A91', 'stroke-width': 3 }, g);
  const ring = el('text', { x: X(HOLD[0]), y: Y(HOLD[1]) - 14, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: '#F7D3DC' }, svg);
  el('circle', { cx: X(HOLD[0]), cy: Y(HOLD[1]), r: 9, fill: '#F7D3DC' }, svg);
  const hl = el('text', { x: X(HOLD[0]) + 16, y: Y(HOLD[1]) + 6, 'text-anchor': 'start', 'font-size': 14, fill: '#F1E6E3' }, svg); hl.textContent = 'remote ở đây';
  const appNote = el('g', { opacity: 0 }, svg);
  el('rect', { x: X(1), y: Y(3.2), width: 10 * S, height: 2.6 * S, rx: 16, fill: '#101F33', 'fill-opacity': .92, stroke: '#D67A91', 'stroke-width': 2 }, appNote);
  const a1 = el('text', { x: X(6), y: Y(4.3), 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: '#F7D3DC' }, appNote); a1.textContent = 'Qua app: không giới hạn khoảng cách';
  const a2 = el('text', { x: X(6), y: Y(4.95), 'text-anchor': 'middle', 'font-size': 16, fill: '#F1E6E3' }, appNote); a2.textContent = 'Người ấy điều khiển qua mạng, ở khác thành phố vẫn được';
  if (!VE.reduce) circ.style.transition = 'r .7s cubic-bezier(.23,1,.32,1)';

  const ans = root.querySelector('[data-calc="planans"]'), list = root.querySelector('[data-calc="rooms"]');
  const btns = [...root.querySelectorAll('.ve-opt')];
  const pick = (b) => {
    btns.forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    const v = b.dataset.r;
    list.replaceChildren();
    if (v === 'app') {
      circ.setAttribute('r', 0); ring.textContent = ''; appNote.setAttribute('opacity', 1);
      roomEls.forEach((rm) => { rm.r.setAttribute('fill-opacity', .2); rm.r.setAttribute('fill', '#D67A91'); });
      ans.textContent = `${data.app.length} món điều khiển qua app: cả căn hộ, cả khi người ấy ở thành phố khác.`;
      data.app.forEach((d) => { const li = document.createElement('li'); const a = document.createElement('a'); a.className = 'plink'; a.href = `${VE.R}san-pham/${d.slug}/index.html`; a.textContent = d.name; li.append(a); list.append(li); });
      track('remote_pick', { pick: 'app' }); return;
    }
    const r = +v; appNote.setAttribute('opacity', 0);
    circ.setAttribute('r', r * S); ring.setAttribute('y', Y(HOLD[1]) - r * S + 22 > Y(0) + 10 ? Y(HOLD[1]) - r * S + 22 : Y(0) + 24); ring.textContent = `${r} m`;
    const inside = [], part = [];
    roomEls.forEach((rm) => {
      const full = rm.far <= r, centre = Math.hypot(rm.cx - HOLD[0], rm.cy - HOLD[1]) <= r;
      rm.r.setAttribute('fill', '#D67A91'); rm.r.setAttribute('fill-opacity', full ? .24 : centre ? .1 : .02);
      rm.t.setAttribute('fill-opacity', full || centre ? 1 : .45);
      if (full) inside.push(rm.name); else if (centre) part.push(rm.name);
    });
    ans.textContent = `${b.querySelector('span').textContent}: remote ${r} m phủ trọn ${inside.length} phòng${part.length ? `, với tới một phần ${part.length} phòng nữa` : ''}.`;
    [['Phủ trọn', inside], ['Một phần', part]].forEach(([lab, L]) => { if (!L.length) return; const li = document.createElement('li'); const b2 = document.createElement('b'); b2.textContent = lab + ': '; li.append(b2, L.join(', ')); list.append(li); });
    track('remote_pick', { pick: b.dataset.slug, range: r });
  };
  btns.forEach((b) => b.addEventListener('click', () => pick(b)));
  if (btns[0]) pick(btns[0]);
})();
