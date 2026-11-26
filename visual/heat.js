/* Visual essay kiểu Anthems: bảng heatmap khám phá theo 5 câu hỏi */
(() => {
  const V = window.VE; if (!V || !V.data) return;
  const root = V.root, D = V.data, GN = Object.fromEntries(D.groups);
  const body = root.querySelector('[data-h="body"]'), sortSel = root.querySelector('[data-h="sort"]'), count = root.querySelector('[data-h="count"]');
  let filter = 'all', lvf = 'all'; const LVN = Object.fromEntries(D.lv.map(([k, n]) => [k, n]));
  const txt = {
    where: (r) => ({ ngoai: 'Bên ngoài', 'ca-hai': 'Cả hai', trong: 'Bên trong' })[r.where] || '—',
    db: (r) => (r.db ? `< ${r.db} dB` : 'chưa công bố'),
    len: (r) => (r.len ? String(r.len).replace('.', ',') + ' cm' : '—'),
    price: (r) => V.vnd(r.price),
  };
  const SORT = {
    score: (a, b) => a.rank - b.rank,
    price: (a, b) => a.price - b.price || a.rank - b.rank,
    len: (a, b) => (a.len ?? 99) - (b.len ?? 99) || a.rank - b.rank,
    db: (a, b) => (a.db ?? 99) - (b.db ?? 99) || a.rank - b.rank,
    name: (a, b) => a.name.localeCompare(b.name, 'vi'),
  };
  const td = (cls, t) => { const c = document.createElement('td'); if (cls) c.className = cls; c.textContent = t; return c; };
  const draw = () => {
    const rs = D.rows.filter((r) => (filter === 'all' || r.cats.includes(filter)) && (lvf === 'all' || r.lv === lvf)).sort(SORT[sortSel.value]);
    body.replaceChildren(...rs.map((r) => {
      const tr = document.createElement('tr');
      const a = document.createElement('a'); a.href = `${V.R}san-pham/${r.slug}/index.html`; a.className = 've-hprod';
      const im = document.createElement('img'); im.src = V.R + r.img; im.alt = ''; im.loading = 'lazy'; im.width = 48; im.height = 48;
      const s = document.createElement('span'); s.textContent = r.name;
      const sm = document.createElement('small'); sm.textContent = r.cats.map((c) => GN[c]).join(' · ') + (r.water ? ' · chống nước' : '');
      s.append(sm); a.append(im, s);
      const c0 = document.createElement('td'); c0.append(a); tr.append(c0);
      const lc = document.createElement('td'); const bd = document.createElement('i'); bd.className = 've-lvb lv-' + r.lv; bd.textContent = LVN[r.lv]; lc.append(bd); tr.append(lc);
      ['where', 'db', 'len', 'price'].forEach((k) => tr.append(td('ve-hc ' + (r.sc[k] ? 'h' + r.sc[k] : 'na'), txt[k](r))));
      return tr;
    }));
    count.textContent = `${rs.length} món.`;
  };
  root.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.f; root.querySelectorAll('[data-f]').forEach((x) => x.setAttribute('aria-pressed', x === b)); draw(); V.track('heat_filter', { group: filter });
  }));
  root.querySelectorAll('[data-l]').forEach((b) => b.addEventListener('click', () => {
    lvf = b.dataset.l; root.querySelectorAll('[data-l]').forEach((x) => x.setAttribute('aria-pressed', x === b)); draw(); V.track('heat_level', { level: lvf });
  }));
  sortSel.addEventListener('change', () => { draw(); V.track('heat_sort', { by: sortSel.value }); });
  draw();
})();
