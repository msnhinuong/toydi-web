/* Bộ công cụ chung cho các bài cẩm nang dạng visual essay */
window.VE = (() => {
  const root = document.querySelector('.ve');
  const R = root ? (root.dataset.root || '../../') : '../../';
  let data = null; try { data = JSON.parse(document.getElementById('ve-data').textContent); } catch (e) {}
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs = {}, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
  const vnd = (n) => Math.round(n).toLocaleString('vi-VN') + 'đ';
  const track = (n, p) => { try { window.tdTrack && window.tdTrack(n, p); } catch (e) {} };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tipFor = (box) => { const t = document.createElement('div'); t.className = 've-tip'; t.hidden = true; box.appendChild(t); return t; };
  const showTip = (box, tip, svg, x, y, text) => {
    const s = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    tip.textContent = text; tip.hidden = false;
    tip.style.left = Math.max(70, Math.min(box.scrollWidth - 70, x * s)) + 'px'; tip.style.top = (y * s) + 'px';
  };
  const clip = (svg, id, r) => { const defs = svg.querySelector('defs') || el('defs', {}, svg); const c = el('clipPath', { id }, defs); el('circle', { cx: 0, cy: 0, r }, c); };
  const dot = (svg, { x, y, r, img, ring, clipId, label, box, tip, onTap }) => {
    const g = el('g', { class: 've-dot', transform: `translate(${x},${y})`, tabindex: 0 }, svg);
    el('circle', { r: r + 2.5, fill: '#fff', stroke: ring, 'stroke-width': 3 }, g);
    el('image', { href: R + img, x: -r, y: -r, width: 2 * r, height: 2 * r, 'clip-path': `url(#${clipId})`, preserveAspectRatio: 'xMidYMid slice', 'aria-label': label }, g);
    const on = () => showTip(box, tip, svg, x, y - r - 3, label);
    g.addEventListener('pointerenter', on); g.addEventListener('focus', on);
    g.addEventListener('click', () => { on(); onTap && onTap(); });
    g.addEventListener('pointerleave', () => { tip.hidden = true; }); g.addEventListener('blur', () => { tip.hidden = true; });
    return g;
  };
  const steps = (fn) => {
    const S = [...document.querySelectorAll('.ve-step')];
    if (!S.length) return;
    if (!('IntersectionObserver' in window)) { fn(S[0].dataset.step); return; }
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return;
      S.forEach((s) => s.classList.toggle('on', s === en.target)); fn(en.target.dataset.step);
    }), { rootMargin: '-45% 0px -45% 0px' });
    S.forEach((s) => io.observe(s));
    fn(S[0].dataset.step);
  };
  const card = (d, sub) => {
    const a = document.createElement('a'); a.className = 've-pick'; a.href = `${R}san-pham/${d.slug}/index.html`;
    const im = document.createElement('img'); im.src = R + d.img; im.alt = d.name; im.loading = 'lazy'; im.width = 400; im.height = 400;
    const s = document.createElement('span'); s.textContent = d.name;
    const sm = document.createElement('small'); sm.textContent = sub;
    a.append(im, s, sm); return a;
  };
  return { root, R, data, el, vnd, track, reduce, tipFor, showTip, clip, dot, steps, card };
})();
