(() => {
  // after-dark extras: candle-light cursor glow + curtain reveals
  document.body.classList.add('js');
  const gl = document.querySelector('.glow');
  if (gl && matchMedia('(hover:hover)').matches) addEventListener('pointermove', e => { gl.style.setProperty('--gx', e.clientX + 'px'); gl.style.setProperty('--gy', e.clientY + 'px'); }, { passive: true }); // candle-light

  const IG = 'https://ig.me/m/toydi.vn';
  const track = window.tdTrack = (n, p) => { try { if (window.gtag) gtag('event', n, p || {}); } catch (e) {} };
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = { get(k) { try { return localStorage.getItem(k) } catch (e) { return null } }, set(k, v) { try { localStorage.setItem(k, v) } catch (e) {} } };

  // highlight the current tab (and keep it in view in the sideways mobile menu)
  (() => { const norm = u => new URL(u, location.href).pathname.replace(/index\.html$/, '');
    const here = norm(location.href), root = norm(window.ROOT || './'); let best = null;
    $$('header.site nav a').forEach(a => { const p = norm(a.href);
      if (p === root ? here === root : here.startsWith(p)) if (!best || p.length > best.p.length) best = { a, p }; });
    if (best) { best.a.setAttribute('aria-current', 'page'); const n = best.a.parentElement; n.scrollLeft = best.a.offsetLeft - (n.clientWidth - best.a.offsetWidth) / 2; } })();

  // toast
  const toast = $('.toast');
  const say = t => { if (!toast) return; toast.textContent = t; toast.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('show'), 3200); };

  // DM buttons: copy a ready message, then open Instagram DM
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-dm]'); if (!b) return;
    e.preventDefault();
    const item = b.dataset.dm;
    track('generate_lead', { item: item || '(tư vấn)', where: b.className.includes('float') ? 'nút nổi' : b.closest('header') ? 'đầu trang' : b.closest('.mbar') ? 'thanh mua' : 'trong trang' });
    const msg = item ? `Chào Toydi, mình muốn đặt: ${item}. Mã đơn đầu qua web: WEB10` : 'Chào Toydi, mình cần tư vấn. Mã đơn đầu qua web: WEB10';
    // open Instagram inside the tap itself (a delayed open is blocked on iPhone Safari); copy the message at the same time
    try { navigator.clipboard.writeText(msg).then(() => say('Đã chép tin nhắn kèm mã WEB10, dán vào Instagram để đặt nhé'), () => {}); } catch (err) {}
    const w = window.open(IG, '_blank', 'noopener');
    if (!w) location.href = IG;
  });

  // share
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-share]'); if (!b) return;
    const data = { title: 'Toydi', text: b.dataset.share, url: location.href };
    if (navigator.share) navigator.share(data).catch(() => {});
    else { try { navigator.clipboard.writeText(`${data.text} ${data.url}`); say('Đã chép link, gửi cho người ấy nhé'); } catch (e) {} }
  });

  // quiz: step by step (13/11)
  const quiz = $('#quiz');
  if (quiz && window.PRODUCTS && window.QTAGS) {
    const ans = {}, Q = $$('.q', quiz), bar = $('.qbar span', quiz), back = $('.qback', quiz), again = $('.qagain', quiz), r = $('.result', quiz);
    let step = 0;
    const steps = () => Q.filter(q => !(q.dataset.k === 'pt' && ans.who === 'chang'));
    const show = () => {
      const S = steps(); Q.forEach(q => q.hidden = true);
      if (step < S.length) { S[step].hidden = false; r.classList.remove('show'); again.hidden = true; }
      const done = step >= S.length; if (done) track('quiz_complete', { who: ans.who || '', feat: ans.feat || '', budget: String(ans.budget || '') });
      $('.qstep-n', quiz).innerHTML = done ? '<b>Kết quả</b> dành cho bạn' : `Bước <b>${step + 1}</b>/${S.length}`;
      bar.style.width = (Math.min(step, S.length) / S.length * 100) + '%'; back.hidden = step === 0 || step >= S.length;
    };
    const pool = () => PRODUCTS.filter(p => QTAGS[p.slug] && !p.noimg);
    const score = p => {
      const t = QTAGS[p.slug]; let s = 0;
      if (ans.who === 'capdoi') s += p.cats.includes('capdoi') ? 6 : -20; else s += p.cats.includes(ans.who) ? 6 : -20;
      if (ans.pt && ans.who !== 'chang') s += t.pt === ans.pt ? 4 : (t.pt === 'CG' || ans.pt === 'CG') && t.pt ? 2 : 0;
      // the feature the customer picked comes first (Thuy 19/11); budget only nudges, a slightly pricier match beats a cheap mismatch
      if (ans.feat) s += t.f.includes(ans.feat) ? 5 : (ans.feat === 'ldr' && t.f.includes('remote') ? -10 : -25);
      const B = +ans.budget;
      if (B) { if (p.price > B) s -= 8 + 10 * (p.price - B) / B; else s += 2 * p.price / B; }
      return s;
    };
    const pics = () => {
      const L = pool().map(p => [score(p), p]).sort((a, b) => b[0] - a[0]).slice(0, 3).map(x => x[1]);
      $$('.qpics img', quiz).forEach((im, k) => { if (!L[k] || im.src.endsWith(L[k].img)) return; im.classList.add('swap'); setTimeout(() => { im.src = ROOT + L[k].img; im.alt = L[k].name; im.classList.remove('swap'); }, 220); });
    };
    const finish = () => {
      const L = pool().map(p => [score(p), p]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
      const [p, ...alt] = L;
      const card = (x, big) => `<a class="${big ? 'rmain' : 'ralt'}" href="${ROOT}san-pham/${x.slug}/index.html"><img src="${ROOT}${x.img}" alt="${x.name}" width="${big ? 160 : 72}" height="${big ? 160 : 72}"><span>${big ? '<span class="tag">Hợp với bạn nhất</span>' : ''}<b>${x.name}</b><i>${x.price.toLocaleString('vi-VN')}đ</i></span></a>`;
      const over = +ans.budget && p.price > +ans.budget;
      r.innerHTML = card(p, true) + (over ? `<p class="rnote">Món đúng tính năng bạn chọn nhỉnh hơn ngân sách ${(p.price - ans.budget).toLocaleString('vi-VN')}đ. Nhắn Toydi để được tư vấn thêm.</p>` : '') + `<p class="rmore">Cũng hợp với bạn</p><div class="ralts">${alt.slice(0, 2).map(x => card(x)).join('')}</div><div class="ctas"><button class="pill solid" data-dm="${p.name}">Nhắn Toydi kèm kết quả</button></div>`;
      r.classList.add('show'); again.hidden = false;
    };
    Q.forEach(q => $$('button', q).forEach(btn => btn.onclick = () => {
      $$('button', q).forEach(x => x.setAttribute('aria-pressed', x === btn)); ans[q.dataset.k] = btn.dataset.v;
      if (q.dataset.k === 'who' && btn.dataset.v === 'chang') delete ans.pt;
      pics(); step++; if (step >= steps().length) { finish(); } show();
    }));
    back.onclick = () => { step = Math.max(0, step - 1); show(); };
    again.onclick = () => { for (const k in ans) delete ans[k]; $$('.q button', quiz).forEach(x => x.setAttribute('aria-pressed', 'false')); step = 0; show(); };
    show();
  }

  // daily: position of the day (filterable, random) + fact
  const daily = $('#daily');
  if (daily && window.DAILY) {
    const P = DAILY.pos, day = Math.floor(Date.now() / 864e5);
    const pool = () => P.map((p, i) => i);
    let pi = day % P.length, fi = day % DAILY.facts.length;
    const dots = n => '●'.repeat(n) + '○'.repeat(3 - n);
    const FALLBACK = ['vong-rung-erocome', 'trung-zung-lilo-dieu-khien', 'gel-sagami', 'quan-lot-zung-mini', 'nhan-ciu', 'but-zung-mini'];
    const toyFor = (p, i) => { const L = window.PRODUCTS || []; return L.find(x => x.slug === (p.toy || FALLBACK[i % FALLBACK.length])) || null; };
    const showPos = () => {
      const p = P[pi];
      const im = $('[data-pos-img]'), fig = im.parentElement; fig.hidden = true;
      im.onload = () => { fig.hidden = false; }; im.onerror = () => { fig.hidden = true; };
      im.alt = 'Minh họa tư thế ' + p.name; im.src = `${ROOT}img/tu-the/${String(pi + 1).padStart(2, '0')}.webp`;
      $('[data-pos-name]').textContent = p.name; $('[data-pos-en]').textContent = p.en;
      $('[data-pos-lv]').textContent = dots(p.level) + ' ' + DAILY.levels[p.level]; $('[data-pos-place]').textContent = DAILY.places[p.place];
      $('[data-pos-steps]').innerHTML = p.steps.map(t => `<li>${t}</li>`).join('');
      $('[data-pos-why]').textContent = p.why; $('[data-pos-tip]').textContent = p.tip;
      const toy = $('[data-pos-toy]'), pr = toyFor(p, pi);
      if (pr) { toy.href = `${ROOT}san-pham/${pr.slug}/index.html`; toy.innerHTML = `<img src="${ROOT}${pr.img}" alt="" width="64" height="64" loading="lazy"><span><small>Thêm cho vui</small>${pr.name} · ${pr.price.toLocaleString('vi-VN')}đ</span>`; toy.hidden = false; }
      else toy.hidden = true;
      const sb = $('[data-share]', daily); if (sb) sb.dataset.share = `Tối nay thử "${p.name}" nhé? Toydi gợi ý`;
    };
    const showFact = () => { const x = DAILY.facts[fi]; $('[data-fact]').textContent = x.text; const fi_ = $('[data-fact-img]'); if (fi_ && x.img) fi_.src = ROOT + x.img; $('[data-fact-src]').textContent = x.src ? 'Nguồn: ' + x.src : ''; };
    // spinning wheel
    const svg = $('.wheel', daily), N = 12, COL = ['#101F33', '#D67A91', '#173F4B', '#F1E6E3', '#702B49', '#F2C9D3'];
    const ICON = ["<rect x=\"6.02944\" y=\"42.97056\" width=\"18\" height=\"12\" transform=\"translate(39.02944 3.71573) rotate(45)\" /> <path d=\"M57.45584,6.54416c-3.51471-3.51472-12.06242-.66551-19.09188,6.364L12.90812,38.364,25.636,51.09188,51.09188,25.636C58.12135,18.60658,60.97056,10.05887,57.45584,6.54416Z\" /> <line x1=\"21.3934\" y1=\"46.84924\" x2=\"12.90812\" y2=\"55.33452\" /> <line x1=\"17.15076\" y1=\"42.6066\" x2=\"8.66548\" y2=\"51.09188\" /> <line x1=\"56.74874\" y1=\"31.29289\" x2=\"45.43503\" y2=\"42.6066\" /> <line x1=\"58.16295\" y1=\"38.36396\" x2=\"52.5061\" y2=\"44.02082\" /> <line x1=\"32.70711\" y1=\"7.25126\" x2=\"21.3934\" y2=\"18.56497\" /> <line x1=\"25.63604\" y1=\"5.83705\" x2=\"19.97918\" y2=\"11.4939\" />", "<polygon points=\"6 32 6 60 8 60 14 56 20 60 26 56 32 60 38 56 44 60 50 56 56 60 58 60 58 32 58 4 56 4 50 8 44 4 38 8 32 4 26 8 20 4 14 8 8 4 6 4 6 32\" /> <circle cx=\"32\" cy=\"32\" r=\"18\" /> <circle cx=\"32\" cy=\"32\" r=\"12\" />", "<path d=\"M26,20H38a8,8,0,0,1,8,8V58a2,2,0,0,1-2,2H20a2,2,0,0,1-2-2V28A8,8,0,0,1,26,20Z\" /> <rect x=\"26\" y=\"12\" width=\"12\" height=\"8\" /> <rect x=\"28\" y=\"4\" width=\"8\" height=\"8\" /> <line x1=\"24\" y1=\"4\" x2=\"46\" y2=\"4\" /> <ellipse cx=\"32\" cy=\"40\" rx=\"6\" ry=\"10\" />", "<circle cx=\"16\" cy=\"44\" r=\"12\" /> <path d=\"M22,34V28a2,2,0,0,0-2-2H12a2,2,0,0,0-2,2v6\" /> <circle cx=\"48\" cy=\"44\" r=\"12\" /> <path d=\"M54,34V28a2,2,0,0,0-2-2H44a2,2,0,0,0-2,2v6\" /> <polyline points=\"16.123 22.003 16 24 16 26\" /> <path d=\"M20.33368,13.05016a16.0566,16.0566,0,0,0-2.36,3.2454\" /> <path d=\"M28.99835,8.2811a15.89958,15.89958,0,0,0-3.81625,1.24\" /> <path d=\"M38.81827,9.52132a15.89968,15.89968,0,0,0-3.81793-1.24047\" /> <path d=\"M46.02768,16.29806a16.0551,16.0551,0,0,0-2.35959-3.246\" /> <polyline points=\"47.877 22.003 48 24 48 26\" />", "<path d=\"M42,48.96V56a3.9989,3.9989,0,0,1-4,4H26a3.9989,3.9989,0,0,1-4-4V48.96\" /> <rect x=\"14\" y=\"4\" width=\"36\" height=\"47.99998\" rx=\"17.99998\" /> <circle cx=\"40\" cy=\"26\" r=\"4\" /> <circle cx=\"24\" cy=\"26\" r=\"4\" /> <ellipse cx=\"32\" cy=\"41\" rx=\"6\" ry=\"3\" />", "<path d=\"M4,20c4,6,4,38,4,38h6s-.79-27.01,2.91-31.4C13.48,22.67,9.3,20,4,20,4,4,20,6,20,6S34,34,38,34H57a2.996,2.996,0,0,1,3,3v3s-.76,10.02-4.88,13.56C50.8,57.28,41.4,58,36,58c-5.88,0-9.6-20.52-19.09-31.4\" />", "<circle cx=\"12.94744\" cy=\"21\" r=\"4\" /> <circle cx=\"32\" cy=\"10\" r=\"4.5\" /> <circle cx=\"51.05256\" cy=\"21\" r=\"5\" /> <circle cx=\"51.05256\" cy=\"43\" r=\"5.5\" /> <circle cx=\"32\" cy=\"54\" r=\"6\" /> <path d=\"M15.25,17.74a21.95026,21.95026,0,0,1,12.27-7.28\" /> <path d=\"M53.05,25.58a22.14091,22.14091,0,0,1,.14,12.35\" /> <path d=\"M37.94,53.18a21.92764,21.92764,0,0,0,9.79-5.8\" /> <path d=\"M36.48,10.46a21.92933,21.92933,0,0,1,11.6,6.52\" />", "<path d=\"M7.02944,44.97056h16a4,4,0,0,1,4,4v4a0,0,0,0,1,0,0h-24a0,0,0,0,1,0,0v-4a4,4,0,0,1,4-4Z\" transform=\"translate(39.02944 3.71573) rotate(45)\" /> <polyline points=\"32.354 37.306 20.686 48.974 15.026 43.314 26.694 31.646\" /> <path d=\"M48.26346,35.53553c-5.46734,5.46734-13.62455,4.76024-19.09189-.7071s-6.17444-13.62455-.7071-19.09189c8.48528-8.48528,24.74873-13.435,28.99137-9.19238S56.74874,27.05025,48.26346,35.53553Z\" />", "<rect x=\"10\" y=\"26\" width=\"12\" height=\"34\" /> <path d=\"M22,26a8,8,0,0,1,16,0V56\" /> <path d=\"M16,26a15,15,0,0,1,30,0V56\" /> <path d=\"M10,26a22,22,0,0,1,44,0V56\" /> <line x1=\"22\" y1=\"52\" x2=\"10\" y2=\"52\" /> <line x1=\"24\" y1=\"26\" x2=\"8\" y2=\"26\" />", "<line x1=\"20.68629\" y1=\"54.62742\" x2=\"9.37258\" y2=\"43.31371\" /> <path d=\"M53.2132,44.72792l-2.82842,2.82843a15.9956,15.9956,0,0,1-22.62742,0L15.02944,60.28427,3.71573,48.97056,40.48528,12.201,42.6066,8.66548c4.68812-4.68813,11.33494-5.63562,14.84924-2.12132s2.56681,10.16112-2.12132,14.84924L51.799,23.51472,34.82843,40.48528a7.99782,7.99782,0,0,0,11.31371,0l1.41421-1.41421a4,4,0,0,1,5.65685,5.65685Z\" />", "<path d=\"M24.05,44.98C12.37,42.52,4,35.85,4,28c0-9.94,13.43-18,30-18\" /> <path d=\"M34,16c14.36,0,26,6.72,26,15,0,6.25-6.64,11.61-16.07,13.86\" /> <circle cx=\"34\" cy=\"46\" r=\"10\" /> <path d=\"M30,46a4,4,0,0,1,4-4\" />", "<path d=\"M48.97055,5.02944h0a10,10,0,0,1,10,10v10a0,0,0,0,1,0,0h-20a0,0,0,0,1,0,0v-10a10,10,0,0,1,10-10Z\" transform=\"translate(24.97056 -30.2254) rotate(45)\" /> <rect x=\"34.36396\" y=\"20.63604\" width=\"8\" height=\"10\" transform=\"translate(29.36396 -19.6188) rotate(45)\" /> <path d=\"M5.12825,58.86836l.00339.00339a6.29,6.29,0,0,0,8.67881.20652l23.57078-21.428a4,4,0,0,0,.13773-5.78819L32.13789,26.481a4,4,0,0,0-5.78819.13773L4.92173,50.18955A6.29,6.29,0,0,0,5.12825,58.86836Z\" /> <line x1=\"51.79899\" y1=\"23.51472\" x2=\"40.48528\" y2=\"12.20101\" /> <line x1=\"57.45584\" y1=\"32\" x2=\"46.14214\" y2=\"43.31371\" /> <line x1=\"58.87006\" y1=\"39.07107\" x2=\"53.2132\" y2=\"44.72792\" /> <line x1=\"32\" y1=\"6.54416\" x2=\"20.68629\" y2=\"17.85786\" /> <line x1=\"24.92893\" y1=\"5.12994\" x2=\"19.27208\" y2=\"10.7868\" /> <line x1=\"26.34315\" y1=\"37.65685\" x2=\"22.10051\" y2=\"41.89949\" />"]; // RudenkoArts line icons (Envato)
    if (svg) {
      let h = '';
      for (let k = 0; k < N; k++) {
        const a0 = (k / N) * 2 * Math.PI - Math.PI / 2, a1 = ((k + 1) / N) * 2 * Math.PI - Math.PI / 2, r = 96;
        const c = COL[k % COL.length], dark = ['#101F33', '#173F4B', '#702B49', '#D67A91'].includes(c);
        h += `<path d="M0 0 L${(r * Math.cos(a0)).toFixed(2)} ${(r * Math.sin(a0)).toFixed(2)} A${r} ${r} 0 0 1 ${(r * Math.cos(a1)).toFixed(2)} ${(r * Math.sin(a1)).toFixed(2)}Z" fill="${c}"/>`;
        const am = (a0 + a1) / 2;
        const ix = (66 * Math.cos(am)).toFixed(2), iy = (66 * Math.sin(am)).toFixed(2);
        h += `<g transform="translate(${ix} ${iy}) rotate(${(am * 180 / Math.PI + 90).toFixed(1)}) scale(.3) translate(-32 -32)" fill="none" stroke="${dark ? '#F1E6E3' : '#702B49'}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${ICON[k % ICON.length]}</g>`;
      }
      h += '<circle r="97" fill="none" stroke="#F1E6E3" stroke-width="3"/>';
      svg.innerHTML = h;
    }
    let rot = 0, spinning = false;
    const modal = $('.posmodal');
    const openModal = () => {
      const p = P[pi]; if (!modal) return;
      const mt = $('.pm-toy', modal), pr = toyFor(p, pi);
      if (pr) { mt.href = `${ROOT}san-pham/${pr.slug}/index.html`; mt.innerHTML = `<img src="${ROOT}${pr.img}" alt="" width="84" height="84"><span><small>Gợi ý cho vui</small><b>${pr.name}</b><i>${pr.price.toLocaleString('vi-VN')}đ</i></span><em>Xem món</em>`; mt.hidden = false; } else mt.hidden = true;
      $('.pm-name', modal).textContent = p.name; $('.pm-en', modal).textContent = p.en + ' · ' + DAILY.levels[p.level] + ' · ' + DAILY.places[p.place]; $('.pm-why', modal).textContent = p.why;
      const art = $('.pm-art', modal); const src = `${ROOT}img/tu-the/${String(pi + 1).padStart(2, '0')}.webp`;
      art.innerHTML = `<span class="pm-num">${String(pi + 1).padStart(2, '0')}</span><span class="pm-dots">${'●'.repeat(p.level)}${'○'.repeat(3 - p.level)}</span>`;
      const im = new Image(); im.onload = () => { art.innerHTML = ''; art.appendChild(im); }; im.alt = 'Minh họa tư thế ' + p.name; im.src = src;
      modal.hidden = false; requestAnimationFrame(() => modal.classList.add('show'));
    };
    const closeModal = () => { if (!modal) return; modal.classList.remove('show'); setTimeout(() => modal.hidden = true, 250); };
    if (modal) { modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.pm-x')) closeModal(); });
      $('[data-pm-more]', modal).onclick = () => { closeModal(); $('.pcard', daily).scrollIntoView({ behavior: 'smooth', block: 'center' }); };
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); }); }
    const pick = () => {
      const ids = pool(); const card = $('.pcard', daily);
      if (!ids.length) { card.querySelector('h3').textContent = 'Chưa có tư thế nào khớp'; return; }
      const others = ids.filter(i => i !== pi); pi = (others.length ? others : ids)[Math.floor(Math.random() * (others.length || ids.length))];
      card.hidden = false; const w = $('.pwait', daily); if (w) w.hidden = true; card.classList.remove('flip'); void card.offsetWidth; card.classList.add('flip'); showPos();
    };
    const spin = () => {
      if (spinning) return; spinning = true; closeModal();
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      rot += (still ? 0 : 1440) + Math.floor(Math.random() * 360);
      if (svg) { svg.style.transition = still ? 'none' : 'transform 3.6s cubic-bezier(.17,.67,.12,1)'; svg.style.transform = `rotate(${rot}deg)`; }
      setTimeout(() => { pick(); spinning = false; openModal(); }, still ? 50 : 3700);
    };
    showFact();
    $$('[data-spin]').forEach(b => b.onclick = spin);
    if (DAILY.facts.length < 2) $('[data-next-fact]').hidden = true;
    $('[data-next-fact]').onclick = () => { fi = (fi + 1) % DAILY.facts.length; showFact(); };
  }

  // floating buttons appear once the hero is scrolled past (they would cover the hero buttons on phones)
  const heroEl = $('.hero');
  if (heroEl) { const ft = () => document.body.classList.toggle('at-top', scrollY < heroEl.offsetHeight - 80); addEventListener('scroll', ft, { passive: true }); ft(); }

  // hero slider
  const hs = $('.hero.hs');
  if (hs) {
    const S = $$('.hslide', hs), D = $$('.hdot', hs), dur = 6000, still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let i = 0, t = null;
    const go = n => {
      i = (n + S.length) % S.length;
      S.forEach((s, k) => { s.classList.toggle('on', k === i); s.setAttribute('aria-hidden', k !== i); s.querySelectorAll('a,button').forEach(x => x.tabIndex = k === i ? 0 : -1); });
      D.forEach((d, k) => { d.classList.remove('on'); if (k === i) { void d.offsetWidth; d.classList.add('on'); } });
      plan();
    };
    const plan = () => { clearTimeout(t); if (!still && !hs.classList.contains('paused')) t = setTimeout(() => go(i + 1), dur); };
    hs.style.setProperty('--hdur', dur / 1000 + 's');
    D.forEach(d => d.onclick = () => go(+d.dataset.i));
    $$('.harr', hs).forEach(b => b.onclick = () => go(i + +b.dataset.d));
    hs.addEventListener('mouseenter', () => { hs.classList.add('paused'); clearTimeout(t); });
    hs.addEventListener('mouseleave', () => { hs.classList.remove('paused'); plan(); });
    hs.addEventListener('focusin', () => { hs.classList.add('paused'); clearTimeout(t); });
    let x0 = null;
    hs.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    hs.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
    document.addEventListener('visibilitychange', () => document.hidden ? clearTimeout(t) : plan());
    go(0);
  }

  // unbox scroll
  const ub = $('.unbox');
  if (ub && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const bw = $('.boxwrap', ub);
    const tick = () => {
      const r = ub.getBoundingClientRect(), total = r.height - innerHeight;
      const t = Math.min(1, Math.max(0, -r.top / total));
      const p = Math.min(1, Math.max(0, (t - .15) / .45)), o = Math.min(1, Math.max(0, (t - .45) / .3));
      bw.style.setProperty('--p', p.toFixed(3)); bw.style.setProperty('--o', o.toFixed(3));
    };
    addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true }); tick();
  } else if (ub) { const bw = $('.boxwrap', ub); bw.style.setProperty('--p', 1); bw.style.setProperty('--o', 1); }

  // catalog filters
  const shop = $('#shop');
  if (shop && window.PRODUCTS) {
    const grid = $('.grid', shop), cnt = $('.count', shop);
    const st = { cat: new URLSearchParams(location.search).get('dm') || 'all', price: new Set(), tag: new Set() };
    const PR = { z: [0, 100000], a: [0, 200000], b: [200000, 400000], c: [400000, 600000], d: [600000, 1e9] };
    const render = () => {
      const list = PRODUCTS.filter(p => (st.cat === 'all' || p.cats.includes(st.cat))
        && (!st.price.size || [...st.price].some(k => p.price >= PR[k][0] && p.price < PR[k][1]))
        && (!st.tag.size || [...st.tag].every(t => p.tags.includes(t))));
      cnt.textContent = `${list.length} món`;
      grid.innerHTML = list.length ? list.map(card).join('') : '<div class="empty" style="grid-column:1/-1">Chưa có món nào khớp bộ lọc. Bỏ bớt lựa chọn, hoặc nhắn Toydi để được gợi ý riêng.</div>';
    };
    $$('.chips button').forEach(b => { b.setAttribute('aria-pressed', b.dataset.cat === st.cat); b.onclick = () => { st.cat = b.dataset.cat; $$('.chips button').forEach(x => x.setAttribute('aria-pressed', x === b)); render(); }; });
    $$('[data-price]').forEach(i => i.onchange = () => { i.checked ? st.price.add(i.dataset.price) : st.price.delete(i.dataset.price); render(); });
    $$('[data-tag]').forEach(i => i.onchange = () => { i.checked ? st.tag.add(i.dataset.tag) : st.tag.delete(i.dataset.tag); render(); });
    const ft = $('.ftoggle'); if (ft) ft.onclick = () => $('.filters').classList.toggle('open');
    render();
  }
  function card(p) {
    return `<a class="card" href="${ROOT}san-pham/${p.slug}/index.html"><div class="ph"><img src="${ROOT}${p.img}" alt="${p.name}" width="600" height="600" loading="lazy">${p.label ? `<span class="tag">${p.label}</span>` : ''}${p.noimg ? `<span class="ph-name">${p.name}<small>Ảnh đang cập nhật</small></span>` : ''}</div><h3>${p.name}</h3><p class="short">${p.short}</p><div class="row"><span class="price">${p.price.toLocaleString('vi-VN')}đ</span><span class="dm" data-dm="${p.name}">Nhắn tin đặt</span></div></a>`;
  }
  window.toydiCard = card;
})();
// product gallery: photo / video tabs (12/11)
(() => {
  document.querySelectorAll('.gal').forEach(g => {
    const th = [...g.querySelectorAll('.th')], sl = [...g.querySelectorAll('.slot')];
    th.forEach(b => b.onclick = () => {
      const k = b.dataset.k;
      th.forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
      sl.forEach(s => {
        const on = s.dataset.k === k; s.classList.toggle('on', on);
        const v = s.querySelector('video'); if (!v) return;
        if (on) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
      });
    });
  });
})();
// Cẩm nang topic filter (12/11)
(() => {
  const ch = document.querySelectorAll('.bchips button'); if (!ch.length) return;
  ch.forEach(b => b.onclick = () => {
    ch.forEach(x => x.setAttribute('aria-pressed', x === b));
    document.querySelectorAll('.ball .post').forEach(p => p.hidden = !(b.dataset.bc === 'all' || p.dataset.cat === b.dataset.bc));
  });
})();
/* video sản phẩm: chạm để phát / dừng, chỉ một video phát cùng lúc */
document.addEventListener('click', ev => {
  const b = ev.target.closest('.rl-play'); if (!b) return;
  const fig = b.closest('.reel'), v = fig.querySelector('video');
  document.querySelectorAll('.reel.on').forEach(f => { if (f !== fig) { f.classList.remove('on'); f.querySelector('video').pause(); } });
  if (v.paused) { try { window.tdTrack && tdTrack('video_play', { video: (v.getAttribute('src') || '').split('/').pop() }); } catch (e) {}
    v.muted = false; v.play().catch(() => { v.muted = true; v.play(); }); fig.classList.add('on'); }
  else { v.pause(); fig.classList.remove('on'); }
});
/* feedback băng trượt: tạm dừng khi chạm, nút qua lại nhảy 1 thẻ */
document.querySelectorAll('.fbslide').forEach(sl => {
  const tr = sl.querySelector('.fbtrack'); let t;
  const hold = () => { sl.classList.add('hold'); clearTimeout(t); t = setTimeout(() => sl.classList.remove('hold'), 4000); };
  sl.addEventListener('touchstart', hold, { passive: true });
  const step = dir => { const a = tr.getAnimations()[0]; if (!a) return; const card = tr.querySelector('.fbc'); const w = card.offsetWidth + 14, tot = tr.scrollWidth / 2;
    const dur = a.effect.getTiming().duration; a.currentTime = ((a.currentTime + dir * dur * w / tot) % dur + dur) % dur; hold(); };
  sl.querySelector('.prev')?.addEventListener('click', () => step(-1));
  sl.querySelector('.next')?.addEventListener('click', () => step(1));
});
/* trang chủ: catalog theo tab, mỗi tab hiện 8 món */
(() => {
  const g = document.querySelector('.hgrid'); if (!g) return;
  const n = +g.dataset.n || 8, more = document.querySelector('[data-hmore]');
  const show = c => { let i = 0; g.querySelectorAll('.card').forEach(el => { const ok = c === 'all' || el.dataset.c.split(' ').includes(c); el.hidden = !(ok && i++ < n); });
    document.querySelectorAll('[data-hc]').forEach(b => b.setAttribute('aria-pressed', b.dataset.hc === c));
    if (more) more.href = more.getAttribute('href').split('?')[0] + (c === 'all' ? '' : '?dm=' + c); };
  document.querySelectorAll('[data-hc]').forEach(b => b.onclick = () => show(b.dataset.hc)); show('all');
})();

/* đo lường: bấm sản phẩm từ bài cẩm nang, bấm sang Instagram */
document.addEventListener('click', ev => {
  const t = window.tdTrack; if (!t) return;
  const a = ev.target.closest('a'); if (!a) return;
  if (a.closest('.art') && /\/san-pham\/[^/]+\//.test(a.href)) t('post_product_click', { product: a.href.split('/san-pham/')[1].split('/')[0], post: location.pathname.split('/cam-nang/')[1]?.split('/')[0] || '' });
  else if (/instagram\.com/.test(a.href)) t('instagram_click', { link: a.href });
});
