var MyWidget=function(r){"use strict";const S=`
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
`,M=`
  .mw{position:fixed;right:24px;bottom:24px;font-family:system-ui, -apple-system, Segoe UI, Roboto, sans-serif;z-index:2147483647}
  .mw-trigger{padding:.6rem 1rem;border:0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.15);cursor:pointer}
  .mw-modal{position:fixed;right:24px;bottom:86px;width:320px;max-width:calc(100vw - 40px);padding:0;border-radius:16px;background:#fff;box-shadow:0 18px 50px rgba(0,0,0,.28)}
  .mw-header{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid rgba(0,0,0,.08)}
  .mw-close{border:0;background:transparent;cursor:pointer;font-size:18px;line-height:1}
  .mw-body{padding:14px}
  .mw-row{display:flex;align-items:center;gap:8px;justify-content:space-between;margin:10px 0}
  .mw-note{margin-top:8px;font-size:12px;color:#666}
`;function p(t){return t?typeof t=="string"?document.querySelector(t):t:document.body}function k(t){const e=document.createElement("div");if(t&&e.attachShadow){const n=e.attachShadow({mode:"open"});return{host:e,mount:n}}return{host:e,mount:e}}function g(t={}){const{target:e="body",lang:n="en",shadow:d=!0,onLangChange:f,openAtStart:_=!1}=t,s=p(e);if(!s){console.error("[MyWidget] Mount target not found:",e);return}if(s.dataset.mwMounted==="1"){console.warn("[MyWidget] Already mounted on target:",e);return}const{host:c,mount:v}=k(d);c.className="mw-root",s.appendChild(c);const h=document.createElement("style");h.textContent=M,v.appendChild(h);const o=document.createElement("div");o.innerHTML=S.trim(),v.appendChild(o);const m=o.querySelector(".mw-trigger"),i=o.querySelector(".mw-modal"),y=o.querySelector(".mw-close"),u=o.querySelector(".mw-lang");u&&(u.value=n);const b=()=>i.hidden=!i.hidden,l=()=>i.hidden=!0,x=a=>{a.key==="Escape"&&l()},E=a=>{!i.hidden&&!i.contains(a.target)&&a.target!==m&&l()};m.addEventListener("click",b),y.addEventListener("click",l),document.addEventListener("keydown",x),document.addEventListener("click",E,!0),u.addEventListener("change",a=>{const L=a.target.value;typeof f=="function"&&f(L),c.dispatchEvent(new CustomEvent("mw:lang",{detail:{value:L}}))}),_&&(i.hidden=!1),c._mw_cleanup=()=>{m.removeEventListener("click",b),y.removeEventListener("click",l),document.removeEventListener("keydown",x),document.removeEventListener("click",E,!0)},s.dataset.mwMounted="1"}function w(t="body"){const e=p(t);if(!e)return;const n=[...e.childNodes].reverse().find(d=>d&&d.classList&&d.classList.contains("mw-root"));n&&n._mw_cleanup&&n._mw_cleanup(),n&&n.remove&&n.remove(),delete e.dataset.mwMounted}const C={init:g,destroy:w};return r.default=C,r.destroy=w,r.init=g,Object.defineProperties(r,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}}),r}({});
