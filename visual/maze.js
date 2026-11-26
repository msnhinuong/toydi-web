/* Visual essay kiểu Abortion Mazes: mỗi kênh mua là một mê cung */
(() => {
  const V = window.VE; if (!V || !V.data) return;
  const root = V.root, D = V.data;
  const q = (k, p = root) => p.querySelector(`[data-mz="${k}"]`);
  const CR = Object.fromEntries(D.crit.map((c) => [c.n, c]));
  const DIRS = { up: [0, -1, 0, 2], right: [1, 0, 1, 3], down: [0, 1, 2, 0], left: [-1, 0, 3, 1] };

  const rng = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* tạo mê cung bằng DFS; walls[i] = [trên, phải, dưới, trái] */
  const make = (n, seed, deadCount) => {
    const R = rng(seed), W = n, H = n, N = W * H;
    const walls = Array.from({ length: N }, () => [1, 1, 1, 1]), seen = new Uint8Array(N);
    const stack = [0]; seen[0] = 1;
    while (stack.length) {
      const c = stack[stack.length - 1], x = c % W, y = (c / W) | 0;
      const nb = Object.values(DIRS).map(([dx, dy, a, b]) => [x + dx, y + dy, a, b]).filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < W && ny < H && !seen[ny * W + nx]);
      if (!nb.length) { stack.pop(); continue; }
      const [nx, ny, a, b] = nb[(R() * nb.length) | 0], ni = ny * W + nx;
      walls[c][a] = 0; walls[ni][b] = 0; seen[ni] = 1; stack.push(ni);
    }
    /* đường đi đúng (BFS) */
    const prev = new Int32Array(N).fill(-1), Q = [0]; prev[0] = 0;
    while (Q.length) { const c = Q.shift(), x = c % W, y = (c / W) | 0; Object.values(DIRS).forEach(([dx, dy, a]) => { const ni = (y + dy) * W + x + dx; if (!walls[c][a] && prev[ni] < 0) { prev[ni] = c; Q.push(ni); } }); }
    const path = []; for (let c = N - 1; c !== 0; c = prev[c]) path.push(c); path.push(0); path.reverse();
    const onPath = new Set(path);
    /* ngõ cụt: ô chỉ có 1 lối mở, không nằm trên đường đúng, chọn những ô xa nhau */
    let dead = [];
    for (let i = 1; i < N - 1; i++) if (!onPath.has(i) && walls[i].reduce((s, w) => s + (w ? 0 : 1), 0) === 1) dead.push(i);
    dead.sort(() => R() - 0.5);
    const picked = [];
    for (const d of dead) { if (picked.length >= deadCount) break; const dx = d % W, dy = (d / W) | 0; if (picked.every((p) => Math.abs(p % W - dx) + Math.abs(((p / W) | 0) - dy) > 2)) picked.push(d); }
    for (const d of dead) { if (picked.length >= deadCount) break; if (!picked.includes(d)) picked.push(d); }
    return { W, H, walls, path, dead: picked };
  };

  const S = 10;
  const drawMaze = (svg, M, opts = {}) => {
    svg.setAttribute('viewBox', opts.pad ? `-2 -8 ${M.W * S + 4} ${M.H * S + 17}` : `-2 -2 ${M.W * S + 4} ${M.H * S + 4}`);
    svg.innerHTML = '';
    const g = V.el('g', {}, svg);
    V.el('rect', { x: 0, y: 0, width: S, height: S, class: 'mz-in' }, g);
    V.el('rect', { x: (M.W - 1) * S, y: (M.H - 1) * S, width: S, height: S, class: 'mz-out' }, g);
    M.dead.forEach((d, k) => {
      const x = (d % M.W) * S, y = ((d / M.W) | 0) * S;
      V.el('rect', { x: x + 1, y: y + 1, width: S - 2, height: S - 2, rx: 2, class: 'mz-dead' }, g);
      if (opts.labels !== false) { const t = V.el('text', { x: x + S / 2, y: y + S / 2 + 2.4, class: 'mz-dn', 'font-size': 6.5 }, g); t.textContent = opts.fails ? opts.fails[k] : ''; }
    });
    let d = '';
    M.walls.forEach((w, i) => {
      const x = (i % M.W) * S, y = ((i / M.W) | 0) * S;
      if (w[0] && i !== 0) d += `M${x} ${y}h${S}`;
      if (w[3] && i !== 0) d += `M${x} ${y}v${S}`;
      if (w[1] && i !== M.W * M.H - 1) d += `M${x + S} ${y}v${S}`;
      if (w[2] && i !== M.W * M.H - 1) d += `M${x} ${y + S}h${S}`;
    });
    V.el('path', { d, class: 'mz-wall', 'stroke-width': opts.sw || 1.4 }, g);
    return g;
  };
  const pt = (M, i) => `${(i % M.W) * S + S / 2},${((i / M.W) | 0) * S + S / 2}`;

  /* --- mê cung chính --- */
  const stage = q('stage'), tabs = [...root.querySelectorAll('.ve-mtab')];
  const done = new Set();
  let cur = null, M = null, pos = 0, trail = [0], svg = null, me = null, line = null, sol = null, hits = new Set();

  const size = (c) => 5 + 2 * c.fails.length;
  const load = (id) => {
    cur = D.ch.find((c) => c.id === id); M = make(size(cur), cur.seed, cur.fails.length);
    pos = 0; trail = [0]; hits = new Set();
    tabs.forEach((t) => t.setAttribute('aria-pressed', t.dataset.m === id ? 'true' : 'false'));
    stage.innerHTML = ''; svg = V.el('svg', { role: 'img', 'aria-label': `Mê cung ${cur.name}, ${M.W} × ${M.H} ô` }, stage);
    drawMaze(svg, M, { fails: cur.fails, pad: true }); svg.style.maxWidth = (M.W * 42 + 40) + 'px';
    const lab = (x, y, t, cls) => { const n = V.el('text', { x, y, class: cls, 'font-size': 4.2 }, svg); n.textContent = t; };
    lab(0, -3.5, 'Muốn mua ↓', 'mz-lab'); lab(M.W * S, M.H * S + 6.5, 'Nhận hàng yên tâm ↑', 'mz-lab r');
    sol = V.el('polyline', { points: M.path.map((i) => pt(M, i)).join(' '), class: 'mz-sol' }, svg); sol.style.display = 'none';
    line = V.el('polyline', { points: pt(M, 0), class: 'mz-trail' }, svg);
    me = V.el('circle', { r: S * 0.3, class: 'mz-me' }, svg); place();
    q('name').textContent = cur.name; q('note').textContent = cur.note;
    const fl = q('fails'); fl.innerHTML = '';
    if (!cur.fails.length) { const li = document.createElement('li'); li.className = 'ok'; li.textContent = 'Không có ngõ cụt: đủ cả 6 tiêu chí.'; fl.append(li); }
    cur.fails.forEach((n) => { const li = document.createElement('li'); li.dataset.n = n; const b = document.createElement('b'); b.textContent = n; li.append(b, ' ' + CR[n].t); fl.append(li); });
    status(done.has(id) ? 'Bạn đã giải mê cung này. Thử kênh khác?' : `${M.W} × ${M.H} ô. Bắt đầu ở góc trên bên trái.`);
  };
  const status = (t) => { q('status').textContent = t; };
  const place = () => { const [x, y] = pt(M, pos).split(','); me.setAttribute('cx', x); me.setAttribute('cy', y); line.setAttribute('points', trail.map((i) => pt(M, i)).join(' ')); };
  const move = (dir) => {
    if (!M) return;
    const [dx, dy, a] = DIRS[dir], x = pos % M.W, y = (pos / M.W) | 0;
    if (M.walls[pos][a]) return;
    const n = (y + dy) * M.W + x + dx; if (x + dx < 0 || y + dy < 0 || x + dx >= M.W || y + dy >= M.H) return;
    pos = n;
    if (trail.length > 1 && trail[trail.length - 2] === n) trail.pop(); else trail.push(n);
    place();
    const k = M.dead.indexOf(n);
    if (k >= 0) {
      const c = CR[cur.fails[k]]; hits.add(k);
      status(`Ngõ cụt #${c.n}: ${c.d}`);
      q('fails').querySelector(`[data-n="${c.n}"]`)?.classList.add('hit');
    } else if (n === M.W * M.H - 1) {
      if (!done.has(cur.id)) { done.add(cur.id); q('done').textContent = done.size; tabs.find((t) => t.dataset.m === cur.id).classList.add('done'); V.track('maze_done', { channel: cur.id }); }
      status(`Tới nơi! ${trail.length - 1} bước${hits.size ? `, đi nhầm ${hits.size} ngõ cụt` : ''}. ${done.size < 5 ? 'Thử kênh khác?' : 'Bạn đã đi hết 5 mê cung.'}`);
    }
  };
  tabs.forEach((t) => t.addEventListener('click', () => load(t.dataset.m)));
  root.querySelectorAll('[data-dir]').forEach((b) => b.addEventListener('click', () => move(b.dataset.dir)));
  stage.addEventListener('keydown', (ev) => { const m = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[ev.key]; if (m) { ev.preventDefault(); move(m); } });
  let p0 = null;
  stage.addEventListener('pointerdown', (ev) => { p0 = [ev.clientX, ev.clientY]; });
  stage.addEventListener('pointerup', (ev) => {
    if (!p0 || !svg) return; const dx = ev.clientX - p0[0], dy = ev.clientY - p0[1]; p0 = null;
    if (Math.hypot(dx, dy) > 24) { move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); return; }
    /* chạm: đi một bước về phía điểm chạm */
    const r = svg.getBoundingClientRect(), s = r.width / svg.viewBox.baseVal.width;
    const cx = (ev.clientX - r.left) / s - 2, cy = (ev.clientY - r.top) / s - 2;
    const [mx, my] = pt(M, pos).split(',').map(Number), ddx = cx - mx, ddy = cy - my;
    if (Math.hypot(ddx, ddy) < S * 0.4) return;
    move(Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 'right' : 'left') : (ddy > 0 ? 'down' : 'up'));
  });
  q('solve').addEventListener('click', () => { const on = sol.style.display === 'none'; sol.style.display = on ? '' : 'none'; q('solve').textContent = on ? 'Ẩn lối ra' : 'Xem lối ra'; });
  q('reset').addEventListener('click', () => { load(cur.id); q('solve').textContent = 'Xem lối ra'; });
  load(D.ch[0].id);

  /* --- 5 mê cung cạnh nhau --- */
  const all = q('all');
  D.ch.forEach((c) => {
    const m = make(size(c), c.seed, c.fails.length);
    const b = document.createElement('button'); b.type = 'button'; b.className = 've-mcard';
    const s = V.el('svg', { 'aria-hidden': 'true' }, b); drawMaze(s, m, { labels: false, sw: 1.1 });
    V.el('polyline', { points: m.path.map((i) => pt(m, i)).join(' '), class: 'mz-sol on' }, s);
    const t = document.createElement('span'); t.textContent = c.name;
    const sm = document.createElement('small'); sm.textContent = `${m.W} × ${m.H} ô · lối ra dài ${m.path.length - 1} bước · ${c.fails.length} ngõ cụt`;
    b.append(t, sm); b.style.setProperty('--sz', size(c));
    b.addEventListener('click', () => { load(c.id); document.getElementById('me-cung').scrollIntoView({ behavior: V.reduce ? 'auto' : 'smooth' }); });
    all.append(b);
  });

  /* --- tự dò một shop --- */
  const box = q('check'), mini = q('mini'), verdict = q('verdict');
  const upd = () => {
    const have = [...box.querySelectorAll('input:checked')].map((i) => +i.value);
    const miss = D.crit.map((c) => c.n).filter((n) => !have.includes(n));
    const m = make(5 + 2 * miss.length, 7, miss.length);
    mini.innerHTML = ''; const s = V.el('svg', { role: 'img', 'aria-label': `Mê cung ${m.W} × ${m.H} ô` }, mini); drawMaze(s, m, { fails: miss }); s.style.maxWidth = (m.W * 24 + 20) + 'px';
    verdict.textContent = !miss.length ? 'Đủ 6/6. Đường ngắn nhất, cứ yên tâm đặt.'
      : miss.length <= 2 ? `Thiếu ${miss.length} tiêu chí (${miss.map((n) => '#' + n).join(', ')}). Hỏi rõ thêm trước khi chuyển tiền.`
      : `Thiếu ${miss.length}/6 tiêu chí. Mê cung khá rối, cân nhắc tìm shop khác.`;
  };
  box.addEventListener('change', upd); upd();
})();
