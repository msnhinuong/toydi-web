/* Visual essay kiểu Pi: đồng hồ mô phỏng các mốc giờ sau khi bao rách */
(() => {
  const root = document.querySelector('.ve'); if (!root) return;
  const sim = root.querySelector('[data-chart="timer"]'); if (!sim) return;
  const q = (k) => sim.querySelector(`[data-sim="${k}"]`);
  const MAX = 168;
  const LANES = [
    { name: 'Levonorgestrel', sub: 'hiệu quả nhất khi uống sớm', end: 72, fade: true },
    { name: 'Ulipristal acetate · vòng tránh thai chứa đồng', sub: 'đến 120 giờ', end: 120 },
    { name: 'PEP phòng HIV', sub: 'càng sớm càng tốt', end: 72, fade: true },
  ];
  const lanes = q('lanes');
  const rows = LANES.map((L) => {
    const row = document.createElement('div'); row.className = 've-lane';
    const lab = document.createElement('p'); lab.className = 've-lane-lab';
    const b = document.createElement('b'); b.textContent = L.name; const s = document.createElement('small'); s.textContent = ' · ' + L.sub; lab.append(b, s);
    const track = document.createElement('div'); track.className = 've-lane-track';
    const bar = document.createElement('span'); bar.className = 've-lane-bar' + (L.fade ? ' fade' : ''); bar.style.width = (L.end / MAX * 100) + '%';
    const endl = document.createElement('i'); endl.className = 've-lane-end'; endl.style.left = (L.end / MAX * 100) + '%'; endl.textContent = L.end + ' giờ';
    const past = document.createElement('span'); past.className = 've-lane-past';
    const nw = document.createElement('span'); nw.className = 've-lane-now';
    track.append(bar, past, endl, nw); row.append(lab, track); lanes.append(row);
    return { L, row, past, nw };
  });
  const axis = document.createElement('div'); axis.className = 've-lane-axis';
  [0, 24, 48, 72, 96, 120, 144, 168].forEach((h) => { const t = document.createElement('span'); t.style.left = (h / MAX * 100) + '%'; t.textContent = h ? `ngày ${h / 24}` : '0'; axis.append(t); });
  lanes.append(axis);

  const range = q('range'), hEl = q('h'), dEl = q('d'), status = q('status'), play = q('play');
  let t = 0, speed = 3, running = false, last = 0, raf = 0;
  const draw = () => {
    const h = Math.floor(t);
    hEl.textContent = h; dEl.textContent = `· ngày ${Math.floor(h / 24) + 1}`; range.value = h;
    const pct = (t / MAX * 100);
    rows.forEach(({ L, row, past, nw }) => { nw.style.left = pct + '%'; past.style.width = Math.min(t, L.end) / MAX * 100 + '%'; row.classList.toggle('over', t > L.end); });
    const ok = LANES.filter((L) => t <= L.end).map((L) => L.name.split(' · ')[0]);
    status.textContent = t > 120 ? `Giờ thứ ${h}: đã qua các mốc tránh thai khẩn cấp và PEP. Hãy đến cơ sở y tế để được tư vấn, và xét nghiệm sau khoảng 2 tuần.`
      : t > 72 ? `Giờ thứ ${h}: levonorgestrel và PEP đã qua mốc 72 giờ. Ulipristal acetate hoặc vòng tránh thai chứa đồng vẫn còn đến giờ thứ 120.`
      : `Giờ thứ ${h}: còn kịp ${ok.length === 3 ? 'cả ba lựa chọn' : ok.join(', ')}. Càng sớm càng tốt.`;
  };
  const tick = (ts) => {
    if (!running) return;
    const dt = last ? (ts - last) / 1000 : 0; last = ts;
    t = Math.min(MAX, t + dt * 12 * speed);
    draw();
    if (t >= MAX) { stop(); return; }
    raf = requestAnimationFrame(tick);
  };
  const start = () => { if (t >= MAX) t = 0; running = true; last = 0; play.textContent = '❚❚ Dừng'; raf = requestAnimationFrame(tick); window.VE && VE.track('timer_play', {}); };
  const stop = () => { running = false; cancelAnimationFrame(raf); play.textContent = '▶ Chạy'; };
  play.addEventListener('click', () => (running ? stop() : start()));
  q('reset').addEventListener('click', () => { stop(); t = 0; draw(); });
  range.addEventListener('input', () => { stop(); t = +range.value; draw(); });
  sim.querySelectorAll('.ve-speed').forEach((b) => b.addEventListener('click', () => {
    speed = +b.dataset.speed; sim.querySelectorAll('.ve-speed').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
  }));
  draw();

  /* đồng hồ trên đầu bài chạy giây */
  const clock = root.querySelector('.ve-clock');
  if (clock && !(window.VE && VE.reduce)) { let s = 0; setInterval(() => { s++; clock.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 1000); }

  /* nhóm chat: tin nhắn hiện dần khi cuộn tới */
  const chat = root.querySelector('[data-chart="chat"]');
  if (chat && 'IntersectionObserver' in window && !(window.VE && VE.reduce)) {
    const msgs = [...chat.children]; msgs.forEach((m) => m.classList.add('wait'));
    new IntersectionObserver((es, o) => es.forEach((en) => { if (!en.isIntersecting) return; o.disconnect(); msgs.forEach((m, i) => setTimeout(() => m.classList.remove('wait'), 450 * i)); }), { threshold: .25 }).observe(chat);
  }
})();
