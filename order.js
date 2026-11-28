/* Toydi – giỏ hàng và đặt hàng trên web (27/11/2026)
   Bật khi window.TD_ORDER_URL có giá trị (link Apps Script). Tắt thì web giữ cách đặt qua Instagram. */
(() => {
  const API = window.TD_ORDER_URL || '';
  if (!API) return;
  const html = document.documentElement; html.classList.add('ord');
  const R = window.ROOT || '';
  const IG = 'https://www.instagram.com/toydi.vn/';
  const SHIP = 35000, FREE = 500000;
  const BANK = { bin: '970423', acc: '03202182901', show: '0320 2182 901', name: 'HO THU THUY', bank: 'TPBank' };
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const vnd = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ';
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[m]);
  const track = (n, p) => { try { window.tdTrack && window.tdTrack(n, p); } catch (e) {} };

  /* ---------- giỏ (lưu trong máy khách) ---------- */
  const KEY = 'td_cart';
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { cart = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} count(); };
  const lines = () => Object.values(cart).filter((x) => x && x.qty > 0);
  // combo: đồ chơi + gel hoặc bao cao su → tự giảm 5% tiền hàng (khớp với Apps Script)
  const KIND = Object.fromEntries((window.PRODUCTS || []).map((p) => [p.slug, p.k || '']));
  const combo = () => { const ks = new Set(lines().map((x) => KIND[x.slug])); return ks.has('toy') && (ks.has('gel') || ks.has('bcs')); };
  const totals = () => {
    const sub = lines().reduce((s, x) => s + x.p * x.qty, 0); const ship = !sub || sub >= FREE ? 0 : SHIP;
    const disc = combo() ? Math.round(sub * 0.05 / 1000) * 1000 : 0;
    return { sub, ship, disc, tot: sub - disc + ship };
  };
  let bar = null;
  const count = () => {
    const n = lines().reduce((s, x) => s + x.qty, 0);
    $$('[data-cart-count]').forEach((b) => { b.textContent = n; b.hidden = !n; });
    // thanh giỏ dính dưới màn hình (trừ trang đặt hàng và trang sản phẩm đã có thanh mua riêng)
    if ($('#checkout') || $('.mbar')) return;
    if (!bar) { bar = document.createElement('a'); bar.className = 'cartbar'; bar.href = R + 'dat-hang/index.html'; document.body.append(bar); }
    const t = totals();
    bar.innerHTML = `<span><em class="cb1"><b>${n} món</b> · ${vnd(t.sub - t.disc)}${t.disc ? ' (đã −5%)' : ''}</em>${t.sub < FREE ? `<small>Thêm ${vnd(FREE - t.sub)} để miễn phí ship</small>` : '<small>Đã được miễn phí ship</small>'}</span><i>Đặt hàng →</i>`;
    bar.hidden = !n; document.body.classList.toggle('has-cartbar', !!n);
  };
  const item = (el) => ({ slug: el.dataset.slug, n: el.dataset.n, p: +el.dataset.p, img: el.dataset.img });
  const add = (it, q = 1) => { if (!it.slug || !it.p) return; const c = cart[it.slug] || { ...it, qty: 0 }; c.qty = Math.min(10, c.qty + q); Object.assign(c, it, { qty: c.qty }); cart[it.slug] = c; save(); track('add_to_cart', { currency: 'VND', value: it.p, items: [{ item_id: it.slug, item_name: it.n, price: it.p, quantity: q }] }); };
  const toast = (h) => { const t = $('.toast'); if (!t) return; t.innerHTML = h; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3600); };

  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('[data-add]'), b = ev.target.closest('[data-buy]');
    if (!a && !b) return;
    ev.preventDefault(); ev.stopPropagation();
    const el = a || b;
    if (b) { if (!cart[el.dataset.slug]) add(item(el)); track('begin_checkout', { currency: 'VND', value: totals().tot }); location.href = R + 'dat-hang/index.html'; return; }
    add(item(el));
    if (el.dataset.also) { const [slug, n, p, img] = el.dataset.also.split('|'); if (!cart[slug]) add({ slug, n, p: +p, img }); }
    toast(`Đã thêm ${esc(el.dataset.also ? 'cả hai món' : el.dataset.n)} vào giỏ · <a href="${R}dat-hang/index.html">Xem giỏ</a>`);
    document.dispatchEvent(new Event('td:cart'));
    if (el.classList.contains('pill') || el.classList.contains('dm')) { const o = el.textContent; el.textContent = '✓ Đã thêm'; el.classList.add('added'); setTimeout(() => { el.textContent = o; el.classList.remove('added'); }, 1400); }
  }, true);
  document.addEventListener('keydown', (ev) => { const el = ev.target.closest && ev.target.closest('span[data-add]'); if (el && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); el.click(); } });
  count();

  /* ---------- trang đặt hàng ---------- */
  const co = $('#checkout'); if (!co) return;
  const P = Object.fromEntries((window.PRODUCTS || []).map((p) => [p.slug, p]));
  // cập nhật giá, ảnh, tên theo dữ liệu mới nhất của web
  Object.values(cart).forEach((c) => { const p = P[c.slug]; if (p) Object.assign(c, { n: p.name, p: p.price, img: p.img }); else delete cart[c.slug]; });
  save();
  const UPS = ['gel-sagami', 'playah-true-fit', 'sagami-0-02', 'gel-vanessa'];

  const render = () => {
    const ls = lines(), t = totals();
    $('#co-items').innerHTML = ls.length ? ls.map((x) => `<div class="co-item"><a href="${R}san-pham/${x.slug}/index.html"><img src="${R}${x.img}" alt="" width="88" height="88"></a><div><a href="${R}san-pham/${x.slug}/index.html"><b>${esc(x.n)}</b></a><small>${vnd(x.p)}</small></div><div class="co-qty"><button type="button" data-q="${x.slug}" data-d="-1" aria-label="Bớt ${esc(x.n)}">−</button><span>${x.qty}</span><button type="button" data-q="${x.slug}" data-d="1" aria-label="Thêm ${esc(x.n)}">+</button></div></div>`).join('')
      : `<p class="co-empty">Giỏ đang trống. <a href="${R}san-pham/index.html">Xem tất cả sản phẩm →</a></p>${(() => { const best = (window.PRODUCTS || []).filter((p) => /bán chạy|best/i.test(p.label || '')).slice(0, 4); const pick = best.length ? best : (window.PRODUCTS || []).filter((p) => p.cats && p.cats.includes('nang')).slice(0, 4); return pick.length ? `<p class="co-h3">Gợi ý cho bạn</p><div class="co-upg co-best">${pick.map((p) => `<div class="co-up"><a href="${R}san-pham/${p.slug}/index.html"><img src="${R}${p.img}" alt="" width="300" height="300" loading="lazy"></a><div><b>${esc(p.name)}</b><small>${vnd(p.price)}</small></div><button type="button" class="pill" data-add data-slug="${p.slug}" data-n="${esc(p.name)}" data-p="${p.price}" data-img="${p.img}">+ Thêm</button></div>`).join('')}</div>` : ''; })()}`;
    const left = FREE - t.sub;
    const ks = new Set(ls.map((x) => KIND[x.slug]));
    const hint = ks.has('toy') && !t.disc ? '<p class="co-hint">Thêm 1 gel bôi trơn hoặc bao cao su để được <b>giảm 5%</b> cả đơn.</p>' : t.disc ? '<p class="co-hint ok">Đã áp dụng <b>giảm 5%</b> combo đồ chơi + gel/bao cao su.</p>' : '';
    $('#co-free').innerHTML = hint + (t.sub ? (left > 0 ? `Thêm <b>${vnd(left)}</b> nữa để được miễn phí ship` : '<b>Đơn được miễn phí ship</b>') + `<i><span style="width:${Math.min(100, (t.sub / FREE) * 100)}%"></span></i>` : '');
    const ups = UPS.filter((s) => P[s] && !cart[s]).slice(0, 2);
    $('#co-ups').innerHTML = ls.length && ups.length ? `<p class="co-h3">Thường mua kèm</p><div class="co-upg">${ups.map((s) => { const p = P[s]; return `<div class="co-up"><img src="${R}${p.img}" alt="" width="300" height="300" loading="lazy"><div><b>${esc(p.name)}</b><small>${vnd(p.price)}</small></div><button type="button" class="pill" data-add data-slug="${s}" data-n="${esc(p.name)}" data-p="${p.price}" data-img="${p.img}">+ Thêm</button></div>`; }).join('')}</div>` : '';
    $('#co-sum').innerHTML = t.sub ? `<p><span>Tạm tính</span><span>${vnd(t.sub)}</span></p>${t.disc ? `<p class="co-disc"><span>Combo đồ chơi + gel/bao cao su (−5%)</span><span>−${vnd(t.disc)}</span></p>` : ''}<p><span>Phí ship</span><span>${t.ship ? vnd(t.ship) : 'Miễn phí'}</span></p><p class="tot"><span>Tổng</span><span>${vnd(t.tot)}</span></p>` : '';
    $('#co-form').hidden = !ls.length;
    $('#co-submit').textContent = `Xác nhận đặt hàng · ${vnd(t.tot)}`;
    if (typeof bank === 'function') bank();
  };
  co.addEventListener('click', (ev) => {
    const q = ev.target.closest('[data-q]'); if (!q) return;
    const c = cart[q.dataset.q]; if (!c) return;
    c.qty += +q.dataset.d; if (c.qty <= 0) delete cart[q.dataset.q];
    save(); render();
  });
  document.addEventListener('td:cart', render);
  const f = $('#co-form');
  const MEM = 'td_buyer';
  try { const m = JSON.parse(localStorage.getItem(MEM) || 'null'); if (m) { ['phone', 'contact', 'ig', 'addr', 'name'].forEach((k) => { if (m[k]) f.elements[k].value = m[k]; }); f.remember.checked = true; } } catch (e) {}
  // chuyển khoản: mã tham chiếu tạo sẵn trên máy, khách chuyển trước rồi tải ảnh giao dịch mới được gửi đơn
  const REF = (() => { try { const o = sessionStorage.getItem('td_ref'); if (o) return o; } catch (e) {} const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let r = 'TOYDI'; for (let i = 0; i < 6; i++) r += a[Math.floor(Math.random() * a.length)]; try { sessionStorage.setItem('td_ref', r); } catch (e) {} return r; })();
  let receipt = null;
  const isCK = () => f.pay.value === 'ck';
  const bank = () => {
    const ck = isCK(); $('#co-bank').hidden = !ck;
    const sb = $('#co-submit'); const t = totals();
    if (ck) {
      $('#co-bamt').textContent = vnd(t.tot); $('#co-bmemo').textContent = REF; $('#co-bmemo-copy').dataset.copy = REF;
      if (bank.amt !== t.tot) { bank.amt = t.tot; try { const q = window.qrcode(0, 'M'); q.addData(vietqr(t.tot, REF)); q.make(); $('#co-bqr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { $('#co-bqr').hidden = true; } }
    }
    const lock = ck && !receipt;
    sb.disabled = lock; sb.classList.toggle('locked', lock);
    if (t.sub) sb.textContent = lock ? 'Tải ảnh chuyển khoản để xác nhận đơn' : `Xác nhận đặt hàng · ${vnd(t.tot)}`;
  };
  // nén ảnh về JPEG ≤1280px để gửi nhẹ
  const shrink = (file) => new Promise((ok, no) => {
    const u = URL.createObjectURL(file), im = new Image();
    im.onload = () => { const k = Math.min(1, 1280 / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok(c.toDataURL('image/jpeg', 0.82)); };
    im.onerror = () => { URL.revokeObjectURL(u); no(new Error('img')); }; im.src = u;
  });
  $('#co-receipt').addEventListener('change', async (ev) => {
    const file = ev.target.files[0]; const er = $('#co-rc-er'); er.textContent = '';
    if (!file) return;
    if (!/^image\//.test(file.type) || file.size > 15e6) { er.textContent = 'Bạn chọn giúp Toydi một file ảnh (JPG, PNG…) dưới 15MB nhé.'; return; }
    $('#co-rc-in').textContent = 'Đang xử lý ảnh…';
    try {
      const url = await shrink(file); receipt = url.split(',')[1];
      const img = $('#co-rc-img'); img.src = url; img.hidden = false; $('#co-rc-in').textContent = 'Đổi ảnh khác'; $('#co-rc').classList.add('has');
      track('receipt_added');
    } catch (e) { receipt = null; $('#co-rc-in').textContent = '＋ Chọn ảnh chuyển khoản'; er.textContent = 'Không đọc được ảnh này, bạn thử ảnh khác giúp Toydi nhé.'; }
    bank();
  });
  f.addEventListener('change', (ev) => { if (ev.target.name === 'pay') bank(); });
  document.addEventListener('td:cart', () => setTimeout(bank, 0));
  $$('.co-copy').forEach((b) => b.addEventListener('click', () => copy(b)));
  function copy(b) { const txt = b.dataset.copy; const ok = () => { const o = b.textContent; b.textContent = 'Đã chép'; setTimeout(() => { b.textContent = o; }, 1200); }; try { navigator.clipboard.writeText(txt).then(ok, ok); } catch (e) { ok(); } }

  const setErr = (name, msg) => { const w = f.elements[name].closest('.co-f'); w.classList.toggle('bad', !!msg); $('.co-er', w).textContent = msg || ''; return msg ? f.elements[name] : null; };
  const check = () => {
    const bad = [];
    const ph = f.phone.value.replace(/[\s.\-]/g, '');
    bad.push(setErr('phone', /^(0|\+84)\d{9}$/.test(ph) ? '' : 'Số điện thoại cần 10 số, ví dụ 0901234567.'));
    const ct = f.contact.value.trim();
    bad.push(setErr('contact', /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(ct) ? '' : 'Điền email để nhận xác nhận đơn, ví dụ vy.nguyen@gmail.com.'));
    const ig = f.ig.value.trim();
    bad.push(setErr('ig', !ig || /^@?[a-z0-9._]{2,30}$/i.test(ig) ? '' : 'Tên Instagram chỉ gồm chữ, số, dấu chấm và gạch dưới, ví dụ @vy.nguyen.'));
    const ad = f.addr.value.trim();
    bad.push(setErr('addr', ad.length >= 12 && /\d|đường|thôn|ấp|xóm|ngõ|hẻm|kiệt/i.test(ad) ? '' : 'Ghi đủ số nhà, đường, phường/xã, quận/huyện, tỉnh/thành (theo địa chỉ cũ) giúp shipper.'));
    const first = bad.find(Boolean); if (first) first.focus();
    return !first;
  };
  ['phone', 'contact', 'ig', 'addr'].forEach((n) => f.elements[n].addEventListener('blur', () => { if (f.elements[n].closest('.co-f').classList.contains('bad')) check(); }));

  const ERR = { phone: 'Số điện thoại chưa đúng, bạn xem lại giúp Toydi nhé.', contact: 'Email chưa đúng, bạn xem lại giúp Toydi nhé.', addr: 'Địa chỉ còn thiếu, bạn ghi rõ hơn giúp Toydi nhé.', receipt: 'Ảnh chuyển khoản chưa gửi được, bạn chọn lại ảnh giúp Toydi nhé.', items: 'Giỏ hàng có món không còn bán, bạn tải lại trang giúp Toydi nhé.', busy: 'Bạn vừa gửi đơn rồi. Đợi vài phút hoặc nhắn Instagram nếu cần sửa đơn.', server: 'Hệ thống đang bận.' };
  f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!check()) return;
    if (isCK() && !receipt) { $('#co-rc-er').textContent = 'Bạn tải ảnh chụp giao dịch chuyển khoản lên trước nhé.'; $('#co-rc').scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    const b = $('#co-submit'); b.disabled = true; b.textContent = 'Đang gửi đơn…';
    $('#co-fail').hidden = true;
    const payload = { phone: f.phone.value.trim(), contact: f.contact.value.trim(), ig: f.ig.value.trim(), addr: f.addr.value.trim(), name: f.name.value.trim(), note: f.note.value.trim(), pay: f.pay.value, website: f.website.value, ref: isCK() ? REF : '', receipt: isCK() ? receipt : '', items: lines().map((x) => ({ slug: x.slug, qty: x.qty })) };
    try {
      const res = await fetch(API, { method: 'POST', body: JSON.stringify(payload), redirect: 'follow' });
      const d = await res.json();
      if (!d.ok) throw Object.assign(new Error(d.error), { code: d.error });
      try { if (f.remember.checked) localStorage.setItem(MEM, JSON.stringify({ phone: payload.phone, contact: payload.contact, ig: payload.ig, addr: payload.addr, name: payload.name })); else localStorage.removeItem(MEM); } catch (e) {}
      done(d, payload);
    } catch (err) {
      $('#co-fail').hidden = false;
      $('#co-fail').innerHTML = `${esc(ERR[err.code] || 'Gửi đơn chưa được, có thể do mạng.')} Thử lại, hoặc <a href="${IG}" target="_blank" rel="noopener">nhắn Instagram @toydi.vn</a> để đặt.`;
      b.disabled = false; render(); bank();
      track('order_error', { reason: err.code || 'network' });
    }
  });

  /* VietQR theo chuẩn EMVCo của NAPAS */
  const tlv = (id, v) => id + String(v.length).padStart(2, '0') + v;
  const crc16 = (s) => { let c = 0xFFFF; for (let i = 0; i < s.length; i++) { c ^= s.charCodeAt(i) << 8; for (let k = 0; k < 8; k++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF; } return c.toString(16).toUpperCase().padStart(4, '0'); };
  const vietqr = (amount, memo) => { const p = tlv('00', '01') + tlv('01', '12') + tlv('38', tlv('00', 'A000000727') + tlv('01', tlv('00', BANK.bin) + tlv('01', BANK.acc)) + tlv('02', 'QRIBFTTA')) + tlv('53', '704') + tlv('54', String(amount)) + tlv('58', 'VN') + tlv('62', tlv('08', memo)) + '6304'; return p + crc16(p); };

  function done(d, payload) {
    track('purchase', { transaction_id: d.code, currency: 'VND', value: d.total, shipping: d.ship, payment_type: payload.pay === 'ck' ? 'chuyen_khoan' : 'cod', items: lines().map((x) => ({ item_id: x.slug, item_name: x.n, price: x.p, quantity: x.qty })) });
    cart = {}; save();
    $('#co-main').hidden = true; const v = $('#co-done'); v.hidden = false;
    $('#co-code').textContent = d.code; $('#co-mail').textContent = payload.contact;
    const ck = payload.pay === 'ck';
    $('#co-pay').hidden = true;
    $('#co-st3').innerHTML = ck ? '<b>3.</b> Toydi đã nhận ảnh chuyển khoản, đối chiếu xong là gửi hàng, không thu thêm khi&nbsp;nhận.' : '<b>3.</b> Nhận hàng, kiểm tra rồi mới thanh&nbsp;toán.';
    try { sessionStorage.removeItem('td_ref'); } catch (e) {}
    scrollTo({ top: 0, behavior: 'smooth' }); v.focus();
  }
  render();
})();
