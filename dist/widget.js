// dist/widget.js
(function () {
  const SPACE_URL = "https://abyss2009-chatgpt-chatbot.hf.space/"; // Gradio Space

  const baseCss = `
    .ca-embed-wrap{position:relative;max-width:900px;margin:0 auto;border:1px solid #ddd;border-radius:12px;overflow:hidden}
    .ca-embed-head{padding:10px 12px;background:#111;color:#fff;font:16px/1.4 system-ui}
    .ca-embed-iframe{width:100%;height:720px;border:0}
    @media (max-width:600px){ .ca-embed-iframe{height:640px} }
  `;

  function injectCss() {
    if (document.getElementById('ca-embed-style')) return;
    const s = document.createElement('style');
    s.id = 'ca-embed-style';
    s.textContent = baseCss;
    document.head.appendChild(s);
  }

  function init(target, opts = {}) {
    const el = (typeof target === 'string') ? document.querySelector(target) : target;
    if (!el) return;

    injectCss();
    const height = Number(opts.height || 720);
    const lang   = opts.lang || 'en';
    const url    = SPACE_URL + (SPACE_URL.includes('?') ? '&' : '?') + 'lang=' + encodeURIComponent(lang);

    el.innerHTML = `
      <div class="ca-embed-wrap">
        <div class="ca-embed-head">${opts.title || 'Chatbot'}</div>
        <iframe
          class="ca-embed-iframe"
          src="${url}"
          allow="clipboard-read; clipboard-write; microphone; camera; geolocation"
          sandbox="allow-scripts allow-forms allow-same-origin allow-downloads allow-popups"
        ></iframe>
      </div>
    `;
    el.querySelector('.ca-embed-iframe').style.height = height + 'px';
  }

  window.CaChatbot = { init };
})();
