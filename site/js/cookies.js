// Consentimento de cookies (LGPD).
// - Mostra o aviso na primeira visita, com "Aceitar todos", "Rejeitar opcionais" e "Personalizar".
// - Guarda a escolha por 12 meses em localStorage ("brm-consent").
// - Scripts opcionais só rodam com consentimento. Para adicionar uma ferramenta, use no <head>:
//     <script type="text/plain" data-cookie-category="analytics" data-src="https://..."></script>
//   (categorias: "analytics" ou "marketing"). Ao ser autorizado, o script é ativado.
// - Qualquer elemento com o atributo data-cookie-preferences abre o painel de preferências.
// - API: window.BRMConsent.get(), .open(); evento "brm:consent" no document a cada escolha.
(function () {
  var KEY = 'brm-consent';
  var VERSION = 1;
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000;
  var CATEGORIES = ['analytics', 'marketing'];

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (c && c.v === VERSION && Date.now() - c.date < MAX_AGE) return c;
    } catch (e) {}
    return null;
  }

  function save(choice) {
    var c = { v: VERSION, date: Date.now(), necessary: true, analytics: !!choice.analytics, marketing: !!choice.marketing };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    apply(c);
    document.dispatchEvent(new CustomEvent('brm:consent', { detail: c }));
    return c;
  }

  // Ativa os scripts das categorias autorizadas e atualiza o Google Consent Mode, se existir
  function apply(c) {
    document.querySelectorAll('script[type="text/plain"][data-cookie-category]').forEach(function (s) {
      if (!c[s.dataset.cookieCategory] || s.dataset.loaded) return;
      var el = document.createElement('script');
      if (s.dataset.src) el.src = s.dataset.src; else el.textContent = s.textContent;
      el.async = true;
      s.dataset.loaded = 'true';
      s.parentNode.insertBefore(el, s.nextSibling);
    });
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: c.analytics ? 'granted' : 'denied',
        ad_storage: c.marketing ? 'granted' : 'denied',
        ad_user_data: c.marketing ? 'granted' : 'denied',
        ad_personalization: c.marketing ? 'granted' : 'denied'
      });
    }
  }

  var banner, dialog, toast;

  function build() {
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Sua privacidade');
    banner.hidden = true;
    banner.innerHTML =
      '<div class="cookie-banner__text"><strong>Sua privacidade</strong>' +
      '<p><span>Usamos cookies necessários para o funcionamento do site. Com a sua permissão, também podemos usar cookies de análise e de marketing. Você pode mudar sua escolha quando quiser.</span> ' +
      '<a href="cookies.html">Política de Cookies</a></p></div>' +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="cookie-btn cookie-btn--ghost" data-cookie-action="customize">Personalizar</button>' +
      '<button type="button" class="cookie-btn cookie-btn--outline" data-cookie-action="reject">Rejeitar opcionais</button>' +
      '<button type="button" class="cookie-btn cookie-btn--solid" data-cookie-action="accept">Aceitar todos</button>' +
      '</div>';

    dialog = document.createElement('dialog');
    dialog.className = 'cookie-dialog';
    dialog.setAttribute('aria-labelledby', 'cookie-dialog-title');
    var row = function (id, title, text, locked) {
      return '<div class="cookie-row"><div><strong>' + title + '</strong><p>' + text + '</p></div>' +
        (locked
          ? '<span class="cookie-always">Sempre ativos</span>'
          : '<label class="cookie-switch"><input type="checkbox" name="' + id + '" aria-label="' + title + '"><span aria-hidden="true"></span></label>') +
        '</div>';
    };
    dialog.innerHTML =
      '<form method="dialog" class="cookie-dialog__form">' +
      '<div class="cookie-dialog__head"><h2 id="cookie-dialog-title">Preferências de cookies</h2>' +
      '<button type="button" class="cookie-close" data-cookie-action="close" aria-label="Fechar">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div>' +
      '<p class="cookie-dialog__intro">Escolha quais categorias de cookies o site pode usar. Os necessários ficam sempre ativos.</p>' +
      row('necessary', 'Necessários', 'Funcionamento e segurança do site, idioma e as suas escolhas de cookies.', true) +
      row('analytics', 'Análise', 'Entender, de forma agregada, como o site é usado para melhorá-lo.') +
      row('marketing', 'Marketing', 'Medir campanhas e exibir comunicações mais relevantes.') +
      '<p class="cookie-dialog__link"><a href="cookies.html">Política de Cookies</a></p>' +
      '<div class="cookie-dialog__actions">' +
      '<button type="button" class="cookie-btn cookie-btn--outline" data-cookie-action="reject">Rejeitar opcionais</button>' +
      '<button type="button" class="cookie-btn cookie-btn--outline" data-cookie-action="save">Salvar preferências</button>' +
      '<button type="button" class="cookie-btn cookie-btn--solid" data-cookie-action="accept">Aceitar todos</button>' +
      '</div></form>';

    toast = document.createElement('div');
    toast.className = 'cookie-toast';
    toast.setAttribute('role', 'status');
    toast.innerHTML = '<span>Preferências salvas.</span>';

    document.body.appendChild(banner);
    document.body.appendChild(dialog);
    document.body.appendChild(toast);
  }

  function showBanner(show) {
    banner.hidden = !show;
    document.documentElement.classList.toggle('has-cookie-banner', show);
  }

  function open() {
    var c = read() || { analytics: false, marketing: false };
    CATEGORIES.forEach(function (k) { dialog.querySelector('input[name="' + k + '"]').checked = !!c[k]; });
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }

  function close() {
    if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
  }

  function done(choice) {
    save(choice);
    showBanner(false);
    close();
    toast.classList.add('is-visible');
    setTimeout(function () { toast.classList.remove('is-visible'); }, 2600);
  }

  document.addEventListener('DOMContentLoaded', function () {
    build();
    var current = read();
    if (current) apply(current); else showBanner(true);

    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-cookie-preferences]');
      if (opener) { e.preventDefault(); open(); return; }
      var btn = e.target.closest('[data-cookie-action]');
      if (!btn) return;
      var action = btn.dataset.cookieAction;
      if (action === 'accept') done({ analytics: true, marketing: true });
      else if (action === 'reject') done({ analytics: false, marketing: false });
      else if (action === 'customize') open();
      else if (action === 'close') close();
      else if (action === 'save') {
        done({
          analytics: dialog.querySelector('input[name="analytics"]').checked,
          marketing: dialog.querySelector('input[name="marketing"]').checked
        });
      }
    });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
  });

  window.BRMConsent = { get: read, open: function () { if (dialog) open(); } };
})();
