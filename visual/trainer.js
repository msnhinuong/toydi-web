/* Cách dùng máy rung: mô phỏng nút bấm như máy thật */
(() => {
  const V = window.VE; if (!V) return;
  const root = V.root;
  const q = (k) => root.querySelector(`[data-dv="${k}"]`);
  const fig = q('fig'); if (!fig) return;

  /* hình máy rung (bút rung chung chung) */
  const svg = V.el('svg', { viewBox: '0 0 240 420', role: 'img', 'aria-label': 'Máy rung mô phỏng' }, fig);
  const waves = V.el('g', { class: 'dv-waves' }, svg);
  [[-1, 0], [1, 0]].forEach(([s]) => [0, 1, 2].forEach((k) => V.el('path', { d: `M${120 + s * (52 + k * 16)} 120 q${s * 10} 40 0 80 q${-s * 10} 40 0 80`, class: 'dv-w', 'data-k': k }, waves)));
  const body = V.el('g', { class: 'dv-body' }, svg);
  V.el('rect', { x: 88, y: 30, width: 64, height: 340, rx: 32, class: 'dv-shell' }, body);
  V.el('rect', { x: 88, y: 30, width: 64, height: 120, rx: 32, class: 'dv-tip' }, body);
  V.el('circle', { cx: 120, cy: 250, r: 13, class: 'dv-b', 'data-b': 'power' }, body);
  V.el('circle', { cx: 120, cy: 212, r: 9, class: 'dv-b', 'data-b': 'up' }, body);
  V.el('circle', { cx: 120, cy: 288, r: 9, class: 'dv-b', 'data-b': 'down' }, body);
  V.el('circle', { cx: 120, cy: 322, r: 7, class: 'dv-b', 'data-b': 'mode' }, body);
  const led = V.el('circle', { cx: 120, cy: 352, r: 4, class: 'dv-led' }, body);
  [['+', 216], ['−', 292]].forEach(([t, y]) => { const n = V.el('text', { x: 120, y, class: 'dv-t' }, body); n.textContent = t; });

  const bars = q('bars');
  for (let i = 1; i <= 10; i++) { const b = document.createElement('i'); b.style.height = 20 + i * 6 + '%'; bars.append(b); }
  const MODES = [
    ['Đều', 'Rung đều: dễ đoán, hợp để làm quen.'],
    ['Nhịp ngắt', 'Nhịp ngắt: có khoảng nghỉ, nhiều người thấy đỡ “tê” hơn.'],
    ['Sóng', 'Sóng: mạnh nhẹ lên xuống, cảm giác dâng dần.'],
  ];
  let on = false, lv = 0, mode = 0, tOn = 0, ups = [];
  const tip = (t) => { q('tip').textContent = t; };
  const ui = () => {
    ['up', 'down', 'mode'].forEach((k) => { q(k).disabled = !on; });
    [...bars.children].forEach((b, i) => b.classList.toggle('on', on && i < lv));
    q('state').textContent = on ? `Đang bật · mức ${lv}/10 · ${MODES[mode][0]}` : 'Đang tắt';
    led.classList.toggle('on', on); fig.classList.toggle('on', on);
  };

  /* nút nguồn: giữ 2 giây */
  const pw = q('power'); let hold = 0, t0 = 0;
  const press = (ev) => {
    if (hold) return; ev && ev.preventDefault(); t0 = performance.now();
    const step = (ts) => {
      const p = Math.min(1, (ts - t0) / 2000); pw.style.setProperty('--p', p * 100 + '%');
      if (p >= 1) { hold = 0; pw.style.setProperty('--p', '0%'); toggle(); return; }
      hold = requestAnimationFrame(step);
    };
    hold = requestAnimationFrame(step);
  };
  const release = () => {
    if (!hold) return; cancelAnimationFrame(hold); hold = 0; pw.style.setProperty('--p', '0%');
    tip(on ? 'Muốn tắt thì cũng giữ nút Nguồn khoảng 2 giây.' : 'Giữ lâu hơn chút, khoảng 2 giây máy mới bật. Nhiều máy làm vậy để không tự bật trong túi.');
  };
  const toggle = () => {
    on = !on;
    if (on) { lv = 1; mode = 0; tOn = performance.now(); ups = []; tip('Đã bật ở mức 1, mức nhẹ nhất. Bắt đầu từ đây, và thử ở bên ngoài trước.'); V.track('device_on', {}); }
    else { lv = 0; tip('Đã tắt. Rửa theo hướng dẫn, lau khô rồi cất vào túi riêng.'); }
    ui();
  };
  pw.addEventListener('pointerdown', press); pw.addEventListener('pointerup', release); pw.addEventListener('pointerleave', release); pw.addEventListener('pointercancel', release);
  pw.addEventListener('keydown', (ev) => { if ((ev.key === ' ' || ev.key === 'Enter') && !ev.repeat) press(ev); });
  pw.addEventListener('keyup', (ev) => { if (ev.key === ' ' || ev.key === 'Enter') release(); });
  pw.addEventListener('contextmenu', (ev) => ev.preventDefault());

  q('up').addEventListener('click', () => {
    if (lv >= 10) { tip('Đã là mức cao nhất. Không cần lên tới đây mới là đúng.'); return; }
    lv++; const now = performance.now(); ups.push(now); ups = ups.filter((x) => now - x < 4000);
    if (ups.length >= 4) tip('Tăng nhanh quá rồi. Ở mỗi mức một lúc, thấy thích thì mới tăng tiếp.');
    else if (lv <= 3) tip(`Mức ${lv}: nhẹ. Thấy thích thì tăng tiếp, không thì cứ giữ nguyên.`);
    else if (lv <= 6) tip(`Mức ${lv}: vừa. Nhiều người dừng ở khoảng này.`);
    else if (lv <= 9) tip(`Mức ${lv}: mạnh. Nếu thấy tê, giảm lại hoặc nghỉ một chút.`);
    else tip('Mức 10, cao nhất. Không cần lên tới đây mới là đúng.');
    ui();
  });
  q('down').addEventListener('click', () => { if (lv > 1) lv--; tip(lv === 1 ? 'Về lại mức nhẹ nhất. Giảm lúc nào cũng được.' : `Mức ${lv}. Giảm lúc nào cũng được, không có mức đúng hay sai.`); ui(); });
  q('mode').addEventListener('click', () => { mode = (mode + 1) % MODES.length; tip(MODES[mode][1] + ' Máy thật thường có 7–20 chế độ, cứ bấm qua từng kiểu.'); ui(); });

  /* rung: biên độ theo mức và chế độ */
  const ws = [...waves.children];
  const anim = (ts) => {
    let a = on ? lv / 10 : 0;
    if (on && mode === 1) a *= (Math.floor(ts / 260) % 2) ? 0.15 : 1;
    if (on && mode === 2) a *= 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(ts / 420));
    const j = V.reduce ? 0 : a * 3.2;
    body.setAttribute('transform', `translate(${(Math.random() - 0.5) * j} ${(Math.random() - 0.5) * j})`);
    ws.forEach((w) => { const k = +w.dataset.k; w.style.opacity = Math.max(0, a * 1.4 - k * 0.3); });
    requestAnimationFrame(anim);
  };
  requestAnimationFrame(anim);
  ui();
})();
