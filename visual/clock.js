/* Visual essay kiểu Loneliness Epidemic: cuộn để thời gian trôi qua một buổi tối */
(() => {
  const V = window.VE; if (!V || !V.data) return;
  const root = V.root, D = V.data;
  const q = (k) => root.querySelector(`[data-ck="${k}"]`);
  const toM = (h) => +h.slice(0, 2) * 60 + +h.slice(3) - 1020;
  const toH = (m) => `${String(17 + Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  const FILL = { 46: 'Kẹt xe ở ngã tư.', 64: 'Minh ghé chợ mua rau.', 122: 'Rửa bát.', 172: 'Đi dạo quanh hồ.', 216: 'Xem nốt tập phim dang dở.', 228: 'Tắm.' };

  /* dòng phút xen giữa các mốc */
  const stream = q('stream'), beats = [...stream.querySelectorAll('.ve-beat')];
  const bm = beats.map((b) => toM(b.dataset.t));
  const frag = [];
  let bi = 0;
  for (let m = 0; m <= 300; m += 2) {
    while (bi < beats.length && bm[bi] <= m) { frag.push(beats[bi]); bi++; }
    if (bm.includes(m)) continue;
    const p = document.createElement('p'); p.className = 've-min' + (FILL[m] ? ' f' : ''); p.dataset.t = toH(m);
    p.textContent = toH(m) + (FILL[m] ? ` · ${FILL[m]}` : ''); p.setAttribute('aria-hidden', 'true');
    frag.push(p);
  }
  while (bi < beats.length) frag.push(beats[bi++]);
  stream.replaceChildren(...frag);

  /* lưới 60 ô × 5 phút */
  const grid = q('grid'), cells = [];
  for (let k = 0; k < 60; k++) { const i = document.createElement('i'); grid.append(i); cells.push(i); }
  const touch = new Set(D.beats.filter((b) => b.touch).map((b) => Math.floor(toM(b.t) / 5)));
  const clock = q('clock'), hero = root.querySelector('.ve-hero .ve-clock');
  let last = -1;
  const set = (m) => {
    if (m === last) return; last = m;
    clock.textContent = toH(Math.min(m, 300));
    const c = Math.floor(m / 5);
    cells.forEach((el, k) => { el.className = k <= c ? (touch.has(k) ? 'on' : 'past') : ''; });
    if (m >= 300) V.track('clock_end', {});
  };
  set(0);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) set(toM(en.target.dataset.t)); }), { rootMargin: '-50% 0px -50% 0px' });
    frag.forEach((el) => io.observe(el));
  } else set(300);

  /* đồng hồ hero nhích dần khi vừa vào trang */
  if (hero && !V.reduce) { let m = 0; const t = setInterval(() => { m++; hero.textContent = toH(m); if (m >= 4) clearInterval(t); }, 1200); }

  /* thang 0–10 */
  const ans = q('lad-ans');
  root.querySelectorAll('.ve-rung').forEach((b) => b.addEventListener('click', () => {
    const v = +b.dataset.v;
    root.querySelectorAll('.ve-rung').forEach((x) => { x.setAttribute('aria-pressed', x === b); x.classList.toggle('below', +x.dataset.v < v); });
    const L = D.ladder.find(([a, z]) => v >= a && v <= z);
    ans.textContent = `Bậc ${v}. ${L[2]}`;
    V.track('ladder_pick', {});
  }));
})();
