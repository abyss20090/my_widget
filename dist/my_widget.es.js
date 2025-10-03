const E = (
  /* html */
  `
  <div class="mw" role="region" aria-label="MyWidget">
    <button class="mw-trigger" aria-haspopup="dialog" aria-controls="mw-modal">Open</button>
    <div class="mw-modal" id="mw-modal" role="dialog" aria-modal="true" hidden>
      <div class="mw-header">
        <strong>Settings</strong>
        <button class="mw-close" aria-label="Close">×</button>
      </div>
      <div class="mw-body">
        <label class="mw-row">
          <span>Language</span>
          <select class="mw-lang">
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </label>
        <!-- Add your own fields/content below -->
        <div class="mw-note">This content is fully controlled by the widget.</div>
      </div>
    </div>
  </div>
`
), L = `
  .mw{position:fixed;right:24px;bottom:24px;font-family:system-ui, -apple-system, Segoe UI, Roboto, sans-serif;z-index:2147483647}
  .mw-trigger{padding:.6rem 1rem;border:0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);cursor:pointer}
  .mw-modal{position:fixed;right:24px;bottom:86px;width:320px;max-width:calc(100vw - 40px);padding:0;border-radius:16px;background:#fff;box-shadow:0 18px 50px rgba(0,0,0,.28)}
  .mw-header{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid rgba(0,0,0,.08)}
  .mw-close{border:0;background:transparent;cursor:pointer;font-size:18px;line-height:1}
  .mw-body{padding:14px}
  .mw-row{display:flex;align-items:center;gap:8px;justify-content:space-between;margin:10px 0}
  .mw-note{margin-top:8px;font-size:12px;color:#666}
`;
function y(t) {
  return t ? typeof t == "string" ? document.querySelector(t) : t : document.body;
}
function S(t) {
  const e = document.createElement("div");
  if (t && e.attachShadow) {
    const o = e.attachShadow({ mode: "open" });
    return { host: e, mount: o };
  }
  return { host: e, mount: e };
}
function k(t = {}) {
  const {
    target: e = "body",
    lang: o = "en",
    shadow: r = !0,
    onLangChange: u,
    openAtStart: x = !1
  } = t, d = y(e);
  if (!d) {
    console.error("[MyWidget] Mount target not found:", e);
    return;
  }
  if (d.dataset.mwMounted === "1") {
    console.warn("[MyWidget] Already mounted on target:", e);
    return;
  }
  const { host: s, mount: p } = S(r);
  s.className = "mw-root", d.appendChild(s);
  const g = document.createElement("style");
  g.textContent = L, p.appendChild(g);
  const n = document.createElement("div");
  n.innerHTML = E.trim(), p.appendChild(n);
  const l = n.querySelector(".mw-trigger"), i = n.querySelector(".mw-modal"), w = n.querySelector(".mw-close"), m = n.querySelector(".mw-lang");
  m && (m.value = o);
  const f = () => i.hidden = !i.hidden, c = () => i.hidden = !0, h = (a) => {
    a.key === "Escape" && c();
  }, v = (a) => {
    !i.hidden && !i.contains(a.target) && a.target !== l && c();
  };
  l.addEventListener("click", f), w.addEventListener("click", c), document.addEventListener("keydown", h), document.addEventListener("click", v, !0), m.addEventListener("change", (a) => {
    const b = a.target.value;
    typeof u == "function" && u(b), s.dispatchEvent(new CustomEvent("mw:lang", { detail: { value: b } }));
  }), x && (i.hidden = !1), s._mw_cleanup = () => {
    l.removeEventListener("click", f), w.removeEventListener("click", c), document.removeEventListener("keydown", h), document.removeEventListener("click", v, !0);
  }, d.dataset.mwMounted = "1";
}
function M(t = "body") {
  const e = y(t);
  if (!e) return;
  const o = [...e.childNodes].reverse().find(
    (r) => r && r.classList && r.classList.contains("mw-root")
  );
  o && o._mw_cleanup && o._mw_cleanup(), o && o.remove && o.remove(), delete e.dataset.mwMounted;
}
const C = { init: k, destroy: M };
export {
  C as default,
  M as destroy,
  k as init
};
