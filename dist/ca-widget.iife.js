/* ca-widget.iife.js — self-contained chat widget (no iframe). All comments are in English. */
(function () {
  const DEFAULTS = {
    target: "body",                   // CSS selector or Element
    api: "",                          // REQUIRED: your Cloudflare Worker endpoint, e.g. https://your-worker.example.com/chat
    lang: "auto",                     // initial language
    storageKeyLang: "mw_lang_v1"      // localStorage key for language
  };

  // Minimal, namespaced styles. Encapsulated via Shadow DOM.
  const STYLE = `
    :host { all: initial; }
    .mw-root { position: fixed; right: 24px; bottom: 24px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; z-index: 2147483647; }
    .mw-btn { padding: .6rem 1rem; border: 0; border-radius: 999px; color: #fff; background: #041e42; box-shadow: 0 8px 24px rgba(0,0,0,.15); cursor: pointer; }
    .mw-modal { position: fixed; right: 24px; bottom: 86px; width: min(680px, 92vw); max-height: min(78vh, 780px); display: none;
                background: #fff; border-radius: 16px; box-shadow: 0 18px 50px rgba(0,0,0,.28); overflow: hidden; }
    .mw-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid rgba(0,0,0,.08); }
    .mw-close { border: 0; background: transparent; cursor: pointer; font-size: 18px; line-height: 1; }
    .mw-body { display: grid; grid-template-rows: auto 1fr auto; height: min(78vh, 780px); }
    .mw-row { display: flex; align-items: center; gap: 10px; padding: 10px; justify-content: space-between; }
    .mw-select { padding: 6px 8px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; }
    .mw-chat { padding: 12px; overflow: auto; background: #fafafa; }
    .mw-msg { max-width: 82%; margin: 8px 0; padding: 10px 12px; border-radius: 14px; line-height: 1.4; white-space: pre-wrap; word-break: break-word; }
    .mw-msg.user { margin-left: auto; background: #e8f0ff; }
    .mw-msg.bot { margin-right: auto; background: #f2f2f2; }
    .mw-inputbar { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 10px; border-top: 1px solid #eee; background: #fff; }
    .mw-input { resize: none; min-height: 44px; max-height: 120px; padding: 10px 12px; border-radius: 12px; border: 1px solid #e5e7eb; outline: none; }
    .mw-send { border: 0; border-radius: 12px; padding: 10px 14px; background: #041e42; color: #fff; cursor: pointer; }
    .mw-small { font-size: 12px; color: #666; }
  `;

  const TEMPLATE = `
    <div class="mw-root" role="region" aria-label="Chat widget">
      <button class="mw-btn" aria-haspopup="dialog" aria-controls="mw-modal">Chat</button>
      <div class="mw-modal" id="mw-modal" role="dialog" aria-modal="true">
        <div class="mw-header">
          <strong>Cheshire Academy Chatbot</strong>
          <button class="mw-close" aria-label="Close">×</button>
        </div>
        <div class="mw-body">
          <div class="mw-row">
            <label>
              <span style="margin-right:8px">Language</span>
              <select class="mw-select" aria-label="Language">
                <option value="auto">Auto / 自动</option>
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="ja">日本語</option>
              </select>
            </label>
            <span class="mw-small">All features run on the host page.</span>
          </div>

          <div class="mw-chat" aria-live="polite"></div>

          <div class="mw-inputbar">
            <textarea class="mw-input" placeholder="Type your message…"></textarea>
            <button class="mw-send">Send</button>
          </div>
        </div>
      </div>
    </div>
  `;

  function q(root, sel) { return root.querySelector(sel); }
  function ce(tag, cls) { const el = document.createElement(tag); if (cls) el.className = cls; return el; }

  function attachShadow() {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style"); style.textContent = STYLE;
    const wrap = document.createElement("div"); wrap.innerHTML = TEMPLATE;
    shadow.append(style, wrap);
    return { host, shadow };
  }

  // Build messages with a system prompt that enforces the selected language.
  function buildMessages(text, lang) {
    const sys = {
      en: "You are a helpful assistant. Reply in natural, concise English.",
      zh: "你是一个乐于助人的助手。请用简体中文自然且简洁地回答。",
      fr: "Vous êtes un assistant utile. Répondez en français naturellement et de manière concise.",
      es: "Eres un asistente útil. Responde en español de forma natural y concisa.",
      ja: "あなたは役に立つアシスタントです。日本語で簡潔かつ自然に回答してください。"
    };
    const system = sys[lang] || "You are a helpful assistant. Use the user's language when appropriate.";
    return [
      { role: "system", content: system },
      { role: "user", content: text }
    ];
  }

  async function callAPI(api, messages) {
    if (!api) throw new Error("[MyWidget] Missing options.api");
    const resp = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });
    if (!resp.ok) {
      const err = await resp.text();
      throw new Error(`API error ${resp.status}: ${err}`);
    }
    const data = await resp.json();
    return data.reply || "";
  }

  function mount(target, options) {
    const opts = Object.assign({}, DEFAULTS, options || {});
    const container = typeof target === "string" ? document.querySelector(opts.target) : (opts.target || document.body);
    if (!container) { console.error("[MyWidget] Mount target not found"); return; }
    if (container.dataset.mwMounted === "1") return; // avoid double mount
    container.dataset.mwMounted = "1";

    const { host, shadow } = attachShadow();
    container.appendChild(host);

    const root   = q(shadow, ".mw-root");
    const btn    = q(shadow, ".mw-btn");
    const modal  = q(shadow, ".mw-modal");
    const closeX = q(shadow, ".mw-close");
    const chat   = q(shadow, ".mw-chat");
    const input  = q(shadow, ".mw-input");
    const send   = q(shadow, ".mw-send");
    const langEl = q(shadow, ".mw-select");

    // Restore language
    const saved = localStorage.getItem(opts.storageKeyLang) || opts.lang || "auto";
    langEl.value = saved;

    function setOpen(open) { modal.style.display = open ? "block" : "none"; }
    btn.addEventListener("click", () => setOpen(modal.style.display !== "block"));
    closeX.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", e => { if (e.key === "Escape") setOpen(false); });

    function addMsg(text, who) {
      const div = ce("div", `mw-msg ${who}`);
      div.textContent = text;
      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    }

    let sending = false;
    async function doSend() {
      if (sending) return;
      const text = (input.value || "").trim();
      if (!text) return;

      const lang = langEl.value;
      localStorage.setItem(opts.storageKeyLang, lang);

      addMsg(text, "user");
      input.value = "";
      sending = true; send.disabled = true; send.textContent = "…";

      try {
        const messages = buildMessages(text, lang);
        const reply = await callAPI(opts.api, messages);
        addMsg(reply || "[empty reply]", "bot");
      } catch (e) {
        console.error(e);
        addMsg("⚠️ " + (e.message || String(e)), "bot");
      } finally {
        sending = false; send.disabled = false; send.textContent = "Send";
      }
    }

    send.addEventListener("click", doSend);
    input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); doSend(); } });

    return { send: doSend, setLanguage(v) { langEl.value = v; localStorage.setItem(opts.storageKeyLang, v); } };
  }

  function init(options = {}) {
    const { target = "body" } = options;
    return mount(target, options);
  }

  // Export globals
  window.MyWidget = { init };
  if (!window.CAWidget) window.CAWidget = window.MyWidget; // backward-compatible alias
})();
