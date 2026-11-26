/* Visual essay kiểu Crokinole: bảng tập tăng mức rung */
(() => {
  const V = window.VE; if (!V || !V.data) return;
  const root = V.root, L = V.data.lessons;
  const q = (k) => root.querySelector(`[data-tr="${k}"]`);
  const C = 300, START = [300, 628];
  const rFor = (lv) => 280 - (lv - 0.5) * 28;

  /* bảng */
  const svg = V.el('svg', { viewBox: '0 0 600 640', role: 'img', 'aria-label': 'Bảng tập: vòng ngoài mức 1–3, vòng giữa 4–6, vòng trong 7–9, tâm là mức 10' }, q('board'));
  V.el('circle', { cx: C, cy: C, r: 292, class: 'tr-rim' }, svg);
  [[280, 'tr-r1'], [196, 'tr-r2'], [112, 'tr-r3'], [28, 'tr-hole']].forEach(([r, c]) => V.el('circle', { cx: C, cy: C, r, class: c }, svg));
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + Math.PI / 8; V.el('circle', { cx: C + Math.cos(a) * 196, cy: C + Math.sin(a) * 196, r: 6, class: 'tr-peg' }, svg); }
  [['Nhẹ · 1–3', 238], ['Vừa · 4–6', 154], ['Mạnh · 7–9', 72]].forEach(([t, r]) => { const n = V.el('text', { x: C, y: C - r + 5, class: 'tr-lab' }, svg); n.textContent = t; });
  const ten = V.el('text', { x: C, y: C + 6, class: 'tr-lab tr-ten' }, svg); ten.textContent = '10';
  V.el('rect', { x: 270, y: 610, width: 60, height: 8, rx: 4, class: 'tr-start' }, svg);
  const layer = V.el('g', {}, svg);

  let li = 0, level = 0, holding = false, t0 = 0, raf = 0, shots = [], seq = [], noGel = false, gel = false, pat = 'deu';
  const done = new Set();
  const fill = q('fill'), lvl = q('lvl'), fb = q('fb'), hold = q('hold');

  const setLesson = (i) => {
    li = Math.max(0, Math.min(L.length - 1, i));
    q('num').textContent = `Bài ${li + 1}/${L.length}`; q('title').textContent = L[li].t; q('desc').textContent = L[li].d;
    q('gel').hidden = li !== 2; q('pat').hidden = li !== 3;
    q('list').querySelectorAll('li').forEach((x, k) => { x.classList.toggle('on', k === li); x.classList.toggle('done', done.has(k)); });
    q('prev').disabled = li === 0; q('next').textContent = li === L.length - 1 ? 'Tập lại từ đầu ↺' : 'Bài tiếp →';
    layer.innerHTML = ''; shots = []; seq = []; noGel = false; q('shots').innerHTML = '';
    fb.textContent = 'Thử đi.'; fb.classList.remove('ok', 'no');
  };
  q('prev').addEventListener('click', () => setLesson(li - 1));
  q('next').addEventListener('click', () => setLesson(li === L.length - 1 ? 0 : li + 1));
  q('list').querySelectorAll('li').forEach((x, k) => { x.tabIndex = 0; x.addEventListener('click', () => setLesson(k)); x.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') setLesson(k); }); });
  const gb = root.querySelector('[data-gel]');
  gb.addEventListener('click', () => { gel = !gel; gb.setAttribute('aria-pressed', gel); gb.textContent = `Gel bôi trơn: ${gel ? 'bật' : 'tắt'}`; });
  root.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => { pat = b.dataset.p; root.querySelectorAll('[data-p]').forEach((x) => x.setAttribute('aria-pressed', x === b)); }));

  /* giữ để tăng mức */
  const meter = () => { fill.style.width = level * 10 + '%'; lvl.textContent = Math.round(level); };
  const grow = (ts) => { if (!holding) return; level = Math.min(10, ((ts - t0) / 2200) * 10); meter(); raf = requestAnimationFrame(grow); };
  const down = (ev) => { if (holding) return; ev && ev.preventDefault(); holding = true; t0 = performance.now(); hold.classList.add('on'); raf = requestAnimationFrame(grow); };
  const up = () => { if (!holding) return; holding = false; cancelAnimationFrame(raf); hold.classList.remove('on'); shoot(Math.max(1, Math.round(level))); level = 0; setTimeout(meter, 500); };
  hold.addEventListener('pointerdown', down); window.addEventListener('pointerup', up); hold.addEventListener('pointercancel', up);
  hold.addEventListener('keydown', (ev) => { if ((ev.key === ' ' || ev.key === 'Enter') && !ev.repeat) down(ev); });
  hold.addEventListener('keyup', (ev) => { if (ev.key === ' ' || ev.key === 'Enter') up(); });
  hold.addEventListener('contextmenu', (ev) => ev.preventDefault());

  const say = (t, ok) => { fb.textContent = t; fb.classList.toggle('ok', ok === true); fb.classList.toggle('no', ok === false); if (ok) { done.add(li); q('list').children[li].classList.add('done'); V.track('trainer_step', { lesson: li + 1 }); } };

  const shoot = (lv) => {
    const rough = li === 2 && !gel;
    const land = rough ? Math.max(1, lv - 3) : lv;
    const a = ((shots.length % 5) - 2) * 0.28 + (li === 4 ? (Math.random() - 0.5) * 0.3 : 0);
    const r = rFor(land), tx = C + Math.sin(a) * r, ty = C + Math.cos(a) * r;
    /* vệt đi */
    const n = 40, pts = [];
    for (let k = 0; k <= n; k++) {
      const u = k / n, x = START[0] + (tx - START[0]) * u, y = START[1] + (ty - START[1]) * u;
      const nx = -(ty - START[1]), ny = tx - START[0], nl = Math.hypot(nx, ny) || 1;
      let off = 0;
      if (rough) off = (Math.sin(u * 37) * 5) * (1 - u);
      else if (li === 3 && pat === 'song') off = Math.sin(u * Math.PI * 6) * 14 * (1 - u * 0.6);
      pts.push([x + nx / nl * off, y + ny / nl * off]);
    }
    const tr = V.el('polyline', { points: pts.map((p) => p.join(',')).join(' '), class: 'tr-trail' + (rough ? ' rough' : '') + (li === 3 && pat === 'nhip' ? ' dash' : '') }, layer);
    const disc = V.el('circle', { r: 15, class: 'tr-disc' + (land === 10 ? ' ten' : '') }, layer);
    const lab = V.el('text', { class: 'tr-dl' }, layer); lab.textContent = land;
    const dur = V.reduce ? 0 : rough ? 1100 : 750, s0 = performance.now();
    const anim = (ts) => {
      const u = dur ? Math.min(1, (ts - s0) / dur) : 1;
      const ease = rough ? Math.min(1, u * 1.15 - Math.sin(u * 18) * 0.03) : 1 - Math.pow(1 - u, 3);
      const p = pts[Math.round(Math.max(0, Math.min(1, ease)) * n)];
      disc.setAttribute('cx', p[0]); disc.setAttribute('cy', p[1]); lab.setAttribute('x', p[0]); lab.setAttribute('y', p[1] + 5);
      if (u < 1) requestAnimationFrame(anim); else judge(lv, land, rough);
    };
    requestAnimationFrame(anim);
    shots.push(land); tr.style.opacity = 1;
    const chip = document.createElement('li'); chip.textContent = `mức ${land}`; q('shots').append(chip);
  };

  const judge = (lv, land, rough) => {
    if (li === 0) {
      if (land <= 3) say(`Chuẩn: mức ${land}. Mức nhẹ giúp cơ thể làm quen trước, rồi mới tăng khi thấy thích.`, true);
      else say(`Mức ${land} hơi mạnh cho phát đầu. Bật mạnh ngay dễ làm vùng nhạy cảm bị “tê”. Giữ nút ngắn hơn rồi thử lại.`, false);
    } else if (li === 1) {
      const prev = seq[seq.length - 1];
      if (prev !== undefined && (land < prev || land - prev > 2)) { say(land < prev ? `Mức ${land} thấp hơn phát trước (mức ${prev}). Tăng dần nhé, bắt đầu chuỗi mới.` : `Từ mức ${prev} nhảy lên ${land} là hơi gắt. Mỗi lần tăng 1–2 mức thôi. Bắt đầu chuỗi mới.`, false); seq = [land]; return; }
      seq.push(land);
      if (seq.length >= 3) say(`Đẹp: ${seq.join(' → ')}. Tăng từng chút một là cách để biết mức nào bạn thích nhất.`, true);
      else say(`Mức ${land}. Còn ${3 - seq.length} phát nữa, nhớ tăng nhẹ thôi.`);
    } else if (li === 2) {
      if (rough) { noGel = true; say(`Không có gel: đĩa khựng lại ở mức ${land} dù bạn giữ tới mức ${lv}. Khô thì ma sát nhiều, cảm giác gắt hơn. Giờ bật gel và thử lại.`); }
      else say(`Có gel: đĩa đi mượt${noGel ? ', xa hơn hẳn phát lúc nãy' : ''}. Một chút gel gốc nước giúp mọi thứ trơn tru, nhất là khi đưa vào trong.`, true);
    } else if (li === 3) {
      const m = { deu: 'Nhịp đều: dễ đoán, hợp để làm quen.', nhip: 'Nhịp ngắt: có khoảng nghỉ, nhiều người thấy đỡ “tê” hơn.', song: 'Nhịp sóng: lên xuống nhẹ nhàng, tạo cảm giác dâng dần.' }[pat];
      say(`${m} Hầu hết máy rung có 7 đến 20 chế độ, cứ bấm qua từng kiểu để tìm kiểu mình thích.`, true);
    } else {
      say(land === 10 ? 'Trúng tâm! Nhưng nếu lần sau không trúng cũng chẳng sao.' : `Mức ${land}, không trúng tâm. Không sao cả: lần đầu là để biết chỗ nào thích, nhịp nào thích.`, true);
    }
  };
  setLesson(0); meter();
})();
