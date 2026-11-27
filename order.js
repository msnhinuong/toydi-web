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
  const totals = () => { const sub = lines().reduce((s, x) => s + x.p * x.qty, 0); const ship = !sub || sub >= FREE ? 0 : SHIP; return { sub, ship, tot: sub + ship }; };
  const count = () => { const n = lines().reduce((s, x) => s + x.qty, 0); $$('[data-cart-count]').forEach((b) => { b.textContent = n; b.hidden = !n; }); };
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
    toast(`Đã thêm ${esc(el.dataset.n)} vào giỏ · <a href="${R}dat-hang/index.html">Xem giỏ</a>`);
    if (el.classList.contains('pill')) { const o = el.textContent; el.textContent = '✓ Đã thêm'; setTimeout(() => { el.textContent = o; }, 1400); }
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
      : `<p class="co-empty">Giỏ đang trống. <a href="${R}san-pham/index.html">Xem sản phẩm →</a></p>`;
    const left = FREE - t.sub;
    $('#co-free').innerHTML = t.sub ? (left > 0 ? `Thêm <b>${vnd(left)}</b> nữa để được miễn phí ship` : '<b>Đơn được miễn phí ship</b>') + `<i><span style="width:${Math.min(100, (t.sub / FREE) * 100)}%"></span></i>` : '';
    const ups = UPS.filter((s) => P[s] && !cart[s]).slice(0, 2);
    $('#co-ups').innerHTML = ls.length && ups.length ? `<p class="co-h3">Thường mua kèm</p><div class="co-upg">${ups.map((s) => { const p = P[s]; return `<div class="co-up"><img src="${R}${p.img}" alt="" width="300" height="300" loading="lazy"><div><b>${esc(p.name)}</b><small>${vnd(p.price)}</small></div><button type="button" class="pill" data-add data-slug="${s}" data-n="${esc(p.name)}" data-p="${p.price}" data-img="${p.img}">+ Thêm</button></div>`; }).join('')}</div>` : '';
    $('#co-sum').innerHTML = t.sub ? `<p><span>Tạm tính</span><span>${vnd(t.sub)}</span></p><p><span>Phí ship</span><span>${t.ship ? vnd(t.ship) : 'Miễn phí'}</span></p><p class="tot"><span>Tổng</span><span>${vnd(t.tot)}</span></p>` : '';
    $('#co-form').hidden = !ls.length;
    $('#co-submit').textContent = `Xác nhận đặt hàng · ${vnd(t.tot)}`;
  };
  co.addEventListener('click', (ev) => {
    const q = ev.target.closest('[data-q]'); if (!q) return;
    const c = cart[q.dataset.q]; if (!c) return;
    c.qty += +q.dataset.d; if (c.qty <= 0) delete cart[q.dataset.q];
    save(); render();
  });
  document.addEventListener('click', (ev) => { if (ev.target.closest('#co-ups [data-add]')) setTimeout(render, 0); });
  const f = $('#co-form');
  f.addEventListener('change', (ev) => { if (ev.target.name === 'pay') $('#co-bank').hidden = ev.target.value !== 'ck'; });
  $$('.co-copy').forEach((b) => b.addEventListener('click', () => copy(b)));
  function copy(b) { const txt = b.dataset.copy; const ok = () => { const o = b.textContent; b.textContent = 'Đã chép'; setTimeout(() => { b.textContent = o; }, 1200); }; try { navigator.clipboard.writeText(txt).then(ok, ok); } catch (e) { ok(); } }

  const setErr = (name, msg) => { const w = f.elements[name].closest('.co-f'); w.classList.toggle('bad', !!msg); $('.co-er', w).textContent = msg || ''; return msg ? f.elements[name] : null; };
  const check = () => {
    const bad = [];
    const ph = f.phone.value.replace(/[\s.\-]/g, '');
    bad.push(setErr('phone', /^(0|\+84)\d{9}$/.test(ph) ? '' : 'Số điện thoại cần 10 số, ví dụ 0901234567.'));
    const ct = f.contact.value.trim();
    bad.push(setErr('contact', /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(ct) || /^@?[a-z0-9._]{2,30}$/i.test(ct) ? '' : 'Điền tên Instagram (ví dụ @vy.nguyen) hoặc email để Toydi xác nhận đơn.'));
    const ad = f.addr.value.trim();
    bad.push(setErr('addr', ad.length >= 12 && /\d|đường|thôn|ấp|xóm|ngõ|hẻm|kiệt/i.test(ad) ? '' : 'Ghi đủ số nhà, đường, phường/xã, quận/huyện, tỉnh/thành (theo địa chỉ cũ) giúp shipper.'));
    const first = bad.find(Boolean); if (first) first.focus();
    return !first;
  };
  ['phone', 'contact', 'addr'].forEach((n) => f.elements[n].addEventListener('blur', () => { if (f.elements[n].closest('.co-f').classList.contains('bad')) check(); }));

  const ERR = { phone: 'Số điện thoại chưa đúng, bạn xem lại giúp Toydi nhé.', contact: 'Instagram hoặc email chưa đúng, bạn xem lại giúp Toydi nhé.', addr: 'Địa chỉ còn thiếu, bạn ghi rõ hơn giúp Toydi nhé.', items: 'Giỏ hàng có món không còn bán, bạn tải lại trang giúp Toydi nhé.', busy: 'Bạn vừa gửi đơn rồi. Đợi vài phút hoặc nhắn Instagram nếu cần sửa đơn.', server: 'Hệ thống đang bận.' };
  f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!check()) return;
    const b = $('#co-submit'); b.disabled = true; b.textContent = 'Đang gửi đơn…';
    $('#co-fail').hidden = true;
    const payload = { phone: f.phone.value.trim(), contact: f.contact.value.trim(), addr: f.addr.value.trim(), name: f.name.value.trim(), note: f.note.value.trim(), pay: f.pay.value, website: f.website.value, items: lines().map((x) => ({ slug: x.slug, qty: x.qty })) };
    try {
      const res = await fetch(API, { method: 'POST', body: JSON.stringify(payload), redirect: 'follow' });
      const d = await res.json();
      if (!d.ok) throw Object.assign(new Error(d.error), { code: d.error });
      done(d, payload);
    } catch (err) {
      $('#co-fail').hidden = false;
      $('#co-fail').innerHTML = `${esc(ERR[err.code] || 'Gửi đơn chưa được, có thể do mạng.')} Thử lại, hoặc <a href="${IG}" target="_blank" rel="noopener">nhắn Instagram @toydi.vn</a> để đặt.`;
      b.disabled = false; render();
      track('order_error', { reason: err.code || 'network' });
    }
  });

  /* VietQR theo chuẩn EMVCo của NAPAS */
  const tlv = (id, v) => id + String(v.length).padStart(2, '0') + v;
  const crc16 = (s) => { let c = 0xFFFF; for (let i = 0; i < s.length; i++) { c ^= s.charCodeAt(i) << 8; for (let k = 0; k < 8; k++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF; } return c.toString(16).toUpperCase().padStart(4, '0'); };
  const vietqr = (amount, memo) => { const p = tlv('00', '01') + tlv('01', '12') + tlv('38', tlv('00', 'A000000727') + tlv('01', tlv('00', BANK.bin) + tlv('01', BANK.acc)) + tlv('02', 'QRIBFTTA')) + tlv('53', '704') + tlv('54', String(amount)) + tlv('58', 'VN') + tlv('62', tlv('08', memo)) + '6304'; return p + crc16(p); };

  function done(d, payload) {
    const memo = d.code.replace(/-/g, '');
    track('purchase', { transaction_id: d.code, currency: 'VND', value: d.total, shipping: d.ship, payment_type: payload.pay === 'ck' ? 'chuyen_khoan' : 'cod', items: lines().map((x) => ({ item_id: x.slug, item_name: x.n, price: x.p, quantity: x.qty })) });
    cart = {}; save();
    $('#co-main').hidden = true; const v = $('#co-done'); v.hidden = false;
    $('#co-code').textContent = d.code;
    const ck = payload.pay === 'ck';
    $('#co-pay').hidden = !ck;
    $('#co-st3').innerHTML = ck ? '<b>3.</b> Tiền về là Toydi gửi hàng, không thu thêm khi&nbsp;nhận.' : '<b>3.</b> Nhận hàng, kiểm tra rồi mới thanh&nbsp;toán.';
    if (ck) {
      $('#co-amt').textContent = vnd(d.total); $('#co-memo').textContent = memo; $('#co-memo-copy').dataset.copy = memo;
      try { const q = window.qrcode(0, 'M'); q.addData(vietqr(d.total, memo)); q.make(); $('#co-qr').innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { $('#co-qr').hidden = true; }
    }
    scrollTo({ top: 0, behavior: 'smooth' }); v.focus();
  }
  render();
})();
