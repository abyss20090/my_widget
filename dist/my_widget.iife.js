/* ca-widget.iife.js (embed-ready) */
(function(){

  const DEFAULTS = {
    iframeBase: 'https://abyss2009-chatgpt-chatbot.hf.space/',
    theme: 'light',
    lang: 'auto',
    storageKeyLang: 'ca_lang',
    storageKeyState: 'ca_widget_state_v1'
  };

  function loadState(key){ try{ return JSON.parse(localStorage.getItem(key)) || {}; }catch{ return {}; } }
  function saveState(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch{} }

  const STYLE = `
    :host{
      /* Theme colors & shadows */
      --ca-navy: #041e42;                    /* Hover/active color (navy) */
      --ca-navyA: rgba(13,28,52,.28);        /* Default semi-transparent button */
      --ca-shadow: 0 18px 50px rgba(0,0,0,.28);
      --ca-radius: 16px;

      /* Chat window base size (keep inner font size unchanged) */
      --ca-w: 640px;   /* Desktop width */
      --ca-h: 750px;   /* Desktop height */
      --ca-compact: .67; /* When opened, outer box shows at 2/3 scale (~ one-third smaller) */
    }

    /* Bottom-right bubble container (initially positioned with right/bottom; switches to left/top after first drag) */
    #ca-chat-bubble{ position:fixed; right:20px; bottom:20px; z-index:9999; }

    /* Trigger button (glassy navy, high-contrast text; draggable) */
    #ca-open{
      width:64px; height:64px; border-radius:999px; border:0; background: var(--ca-navyA);
      color:#fff; cursor:grab; outline:0;
      box-shadow: var(--ca-shadow);
      backdrop-filter: blur(18px) saturate(160%) contrast(1.05);
      -webkit-backdrop-filter: blur(18px) saturate(160%) contrast(1.05);
      transition: background-color .25s ease, transform .12s ease, opacity .25s ease;
      overflow:hidden; display:flex; align-items:center; justify-content:center;
    }
    #ca-open:active{ cursor:grabbing; transform: scale(.98); }
    #ca-open:hover, #ca-open.active{ background: var(--ca-navy); }

    /* Glassy highlight/inner shadow for the button (doesn't change opacity) */
    #ca-open::before{
      content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
      background:
        radial-gradient(120% 120% at 20% 12%, rgba(255,255,255,.38), rgba(255,255,255,.12) 44%, rgba(255,255,255,0) 60%),
        radial-gradient(90% 90% at 80% 88%, rgba(0,0,0,.22), rgba(0,0,0,0) 60%);
      mix-blend-mode:screen;
    }

    /* Premium-looking robot icon (gradient stroke, follows currentColor) */
    #ca-open svg{ width:32px; height:32px; display:block; }

    /* Liquid ripple */
    #ca-open .ripple{
      position:absolute; border-radius:50%; pointer-events:none;
      transform: scale(0); opacity:.55;
      background: radial-gradient(closest-side, rgba(255,255,255,.9), rgba(255,255,255,.35), rgba(255,255,255,0));
      animation: ca-ripple .7s ease-out forwards; mix-blend-mode: screen;
    }
    @keyframes ca-ripple{ to{ transform: scale(7); opacity:0; } }

    /* Transparent overlay for closing on outside click */
    #ca-overlay{ position:fixed; inset:0; display:none; background:transparent; z-index:9998; }

    /* Floating panel (glassy white, subtle gradient and border) */
    #ca-panel{
      position:fixed; right:20px; bottom:110px; display:none; z-index:9999;
      border-radius: var(--ca-radius); overflow:hidden; box-shadow: var(--ca-shadow);
      background: linear-gradient( to bottom right, rgba(255,255,255,.28), rgba(255,255,255,.18) );
      border: 1px solid rgba(255,255,255,.38);
      backdrop-filter: blur(22px) saturate(180%) brightness(1.08);
      -webkit-backdrop-filter: blur(22px) saturate(180%) brightness(1.08);
    }
    #ca-panel::before{
      content:""; position:absolute; inset:0; pointer-events:none;
      background:
        radial-gradient(120% 120% at 12% 8%, rgba(255,255,255,.55), rgba(255,255,255,.12) 38%, rgba(255,255,255,0) 60%),
        radial-gradient(90% 90% at 88% 92%, rgba(0,0,0,.18), rgba(0,0,0,0) 60%);
      mix-blend-mode: screen;
    }

    /* Title bar (holds language menu, avoids covering content) */
    #ca-panel .bar{
      display:flex; align-items:center; justify-content:space-between;
      gap:12px; padding:12px 14px 0 14px;
      font: 600 16px/1.3 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      color:#1a1f36;
    }
    #ca-panel .bar .title{ padding-left:2px; }
    #ca-panel .bar .lang{
      display:flex; align-items:center; gap:8px;
      background: rgba(255,255,255,.55);
      border:1px solid rgba(0,0,0,.06);
      border-radius: 10px; padding:6px 8px;
      backdrop-filter: blur(8px);
    }
    #ca-panel .bar .lang svg{ width:16px; height:16px; opacity:.9; }
    #ca-panel .bar select{
      appearance:none; -webkit-appearance:none; -moz-appearance:none;
      border:none; background:transparent; outline:none; cursor:pointer;
      font: 600 13px/1.1 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    }

    #ca-panel .frame{ position:relative; padding:12px; }
    #ca-panel .content{ position:relative; width: var(--ca-w); height: var(--ca-h); }
    #ca-panel.compact .content{
      width: calc(var(--ca-w) * var(--ca-compact));
      height: calc(var(--ca-h) * var(--ca-compact));
    }
    #ca-panel .vibrancy{
      position:absolute; inset:0; border-radius:12px; pointer-events:none;
      background: linear-gradient( to bottom right, rgba(255,255,255,.75), rgba(255,255,255,.38) );
      border:1px solid rgba(255,255,255,.45);
      box-shadow: 0 18px 50px rgba(0,0,0,.28) inset, 0 6px 18px rgba(0,0,0,.12);
      backdrop-filter: blur(22px) saturate(180%) brightness(1.08);
      -webkit-backdrop-filter: blur(22px) saturate(180%) brightness(1.08);
    }
    #ca-panel iframe{
      width:100%; height:100%; border:0; border-radius:12px; background:#fff;
      position:relative; z-index:1;
      box-shadow: 0 10px 30px rgba(0,0,0,.15);
    }
  `;

  const TEMPLATE = `
  <div id="ca-overlay"></div>

  <div id="ca-chat-bubble">
    <button id="ca-open" aria-label="Chat with CA" title="Chat with CA">
      <!-- simplified robot icon -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="4" y="7" width="16" height="12" rx="6"></rect>
        <circle cx="9" cy="13" r="1.6"></circle>
        <circle cx="15" cy="13" r="1.6"></circle>
        <path d="M12 7V4"></path>
        <path d="M7 19c1.5 1 3.2 1.5 5 1.5s3.5-.5 5-1.5"></path>
        <path d="M3 12h2M19 12h2"></path>
      </svg>
    </button>

    <div id="ca-panel" role="dialog" aria-modal="true" aria-label="Cheshire Academy Chat">
      <div class="bar">
        <div class="title">Cheshire Academy Chatbot</div>
        <div class="lang" title="Language">
          <svg viewBox="0 0 24 24" fill="none" stroke="#172033" stroke-width="1.6">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M3 12h18M12 3a12.5 12.5 0 0 1 0 18M12 3a12.5 12.5 0 0 0 0 18"></path>
          </svg>
          <select id="ca-lang" aria-label="Language">
            <option value="auto">🌐 Auto / 自动 (auto)</option>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="zh">中文</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="pt">Português</option>
            <option value="ar">العربية</option>
            <option value="ru">Русский</option>
          </select>
        </div>
      </div>

      <div class="frame">
        <div class="content">
          <div class="vibrancy"></div>
          <iframe id="ca-iframe" src="" allow="clipboard-read; clipboard-write; microphone; camera; geolocation"
            sandbox="allow-scripts allow-forms allow-same-origin allow-downloads allow-popups"
            loading="lazy"></iframe>
        </div>
      </div>
    </div>
  </div>
  `;

  function createShadowRoot(){
    const host = document.createElement('div');
    host.setAttribute('data-ca-widget-host','');
    const shadow = host.attachShadow({mode:'open'});
    const styleEl = document.createElement('style'); styleEl.textContent = STYLE;
    const container = document.createElement('div'); container.innerHTML = TEMPLATE;
    shadow.append(styleEl, container);
    return { host, shadow };
  }

  function makeURL(base, theme, lang){
    try {
      const u = new URL(base);
      u.searchParams.set('__theme', theme || DEFAULTS.theme);
      if (lang && lang !== 'auto') u.searchParams.set('lang', lang);
      return u.toString();
    } catch (e) {
      return base;
    }
  }

  function mountWidget(options = {}){
    const opts = Object.assign({}, DEFAULTS, options);
    const mountEl = typeof opts.target === 'string' ? document.querySelector(opts.target) : (opts.target || document.body);
    if (!mountEl) throw new Error('[CAWidget] target not found');

    const { host, shadow } = createShadowRoot();
    mountEl.replaceChildren(host);

    const btn     = shadow.getElementById('ca-open');
    const bubble  = shadow.getElementById('ca-chat-bubble');
    const panel   = shadow.getElementById('ca-panel');
    const overlay = shadow.getElementById('ca-overlay');
    const iframe  = shadow.getElementById('ca-iframe');
    const langSel = shadow.getElementById('ca-lang');

    const isOpen = () => panel && panel.style.display === 'block';
    const getSavedLang = () => localStorage.getItem(opts.storageKeyLang) || opts.lang;
    const setSavedLang = (v) => { try{ localStorage.setItem(opts.storageKeyLang, v); }catch{} };

    const buildSrc = () => makeURL(opts.iframeBase, opts.theme, getSavedLang());
    const updateIframe = () => { if(iframe) iframe.src = buildSrc(); };

    if (langSel) langSel.value = getSavedLang();
    updateIframe();
    langSel && langSel.addEventListener('change', ()=>{ setSavedLang(langSel.value); updateIframe(); });

    function positionPanelToButton(){
      if (!bubble || !panel) return;
      const b  = bubble.getBoundingClientRect();
      const pw = panel.offsetWidth  || 420;
      const ph = panel.offsetHeight || 700;
      const left = Math.min(window.innerWidth - pw - 10, Math.max(10, b.left + b.width - pw));
      const top  = Math.max(10, b.top - (ph + 18));
      panel.style.left = left + 'px';
      panel.style.top  = top  + 'px';
      panel.style.right = 'auto';
      panel.style.bottom= 'auto';
    }

    function showRipple(ev){
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height)*1.2;
      const r = document.createElement('span'); r.className = 'ripple';
      const pt = ev ? { x: ev.clientX ?? ev.touches?.[0]?.clientX ?? rect.left+rect.width/2,
                        y: ev.clientY ?? ev.touches?.[0]?.clientY ?? rect.top+rect.height/2 }
                    : { x: rect.left+rect.width/2, y: rect.top+rect.height/2 };
      r.style.width = r.style.height = size + 'px';
      r.style.left = (pt.x - rect.left - size/2) + 'px';
      r.style.top  = (pt.y - rect.top  - size/2) + 'px';
      btn.appendChild(r); setTimeout(()=> r.remove(), 750);
    }

    function openPanel(ev){
      if (!panel || !overlay || !btn) return;
      panel.style.display = 'block';
      overlay.style.display = 'block';
      btn.classList.add('active');
      panel.classList.add('compact');
      positionPanelToButton();
      if (ev) showRipple(ev);
    }
    function closePanel(){
      if (!panel || !overlay || !btn) return;
      panel.style.display = 'none';
      overlay.style.display = 'none';
      btn.classList.remove('active');
    }
    function togglePanel(ev){ isOpen() ? closePanel() : openPanel(ev); }

    // —— Drag vs tap detection
    let dragging=false, moved=false;
    let startX=0, startY=0, startLeft=0, startTop=0, usingLeftTop=false;
    const THRESHOLD=6;
    let swallowClick=false;

    function ensureLeftTopPosition(){
      if (usingLeftTop) return;
      const rect = bubble.getBoundingClientRect();
      bubble.style.left = rect.left + 'px';
      bubble.style.top  = rect.top  + 'px';
      bubble.style.right='auto';
      bubble.style.bottom='auto';
      usingLeftTop = true;
    }

    function getPoint(e){
      if (e.touches && e.touches[0]) return { x:e.touches[0].clientX, y:e.touches[0].clientY };
      return { x:e.clientX, y:e.clientY };
    }

    function onPointerDown(ev){
      btn.setPointerCapture?.(ev.pointerId);
      ensureLeftTopPosition();
      dragging = true; moved=false;
      const pt = getPoint(ev);
      startX = pt.x; startY = pt.y;
      const rect = bubble.getBoundingClientRect();
      startLeft = rect.left; startTop = rect.top;
    }
    function onPointerMove(ev){
      if (!dragging) return;
      const pt = getPoint(ev);
      const dx = pt.x - startX;
      const dy = pt.y - startY;
      if (!moved && (Math.abs(dx) > THRESHOLD || Math.abs(dy) > THRESHOLD)) moved = true;
      if (!moved) return;
      let left = startLeft + dx;
      let top  = startTop  + dy;
      const margin=10, bw=bubble.offsetWidth, bh=bubble.offsetHeight;
      left = Math.min(window.innerWidth - bw - margin, Math.max(margin, left));
      top  = Math.min(window.innerHeight - bh - margin, Math.max(margin, top));
      bubble.style.left = left + 'px';
      bubble.style.top  = top  + 'px';
      if (isOpen()) positionPanelToButton();
      ev.preventDefault();
    }
    function onPointerUp(){
      if (!dragging) return;
      dragging=false;
      swallowClick = true; setTimeout(()=> swallowClick=false, 0);
    }
    function onClick(e){
      if (swallowClick){ e.preventDefault(); e.stopPropagation(); return; }
      togglePanel(e);
    }

    btn && btn.addEventListener('pointerdown', onPointerDown);
    btn && btn.addEventListener('pointermove', onPointerMove);
    btn && btn.addEventListener('pointerup', onPointerUp);
    btn && btn.addEventListener('pointercancel', onPointerUp);
    btn && btn.addEventListener('click', onClick);

    overlay && overlay.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e)=>{ if (e.key==='Escape' && isOpen()) closePanel(); });

    return { open: openPanel, close: closePanel, update: updateIframe };
  }

  function init(opts){ return mountWidget(opts); }
  window.CAWidget = { init };
})();
