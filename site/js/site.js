// BRM Asset — comportamento e animações do site.
// Mesmo vocabulário do site do Grupo Beiramar: revelação ao rolar, cabeçalho
// que muda com a rolagem e números que contam até o valor final.
(function () {
  var reduce = !document.documentElement.classList.contains('motion');

  document.addEventListener('DOMContentLoaded', function () {
    var header = document.querySelector('.page header');
    var hero = document.querySelector('.page > section.hero');

    // Menu do cabeçalho em telas estreitas
    var toggle = document.querySelector('.nav-toggle');
    if (toggle && header) {
      toggle.addEventListener('click', function () {
        var open = header.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      });
    }

    // Cabeçalho fixo e compacto depois do topo da página
    if (header) {
      var spacer = document.createElement('div');
      spacer.className = 'header-spacer';
      spacer.setAttribute('aria-hidden', 'true');
      header.parentNode.insertBefore(spacer, header);
      var progress = document.createElement('div');
      progress.className = 'scroll-progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.appendChild(progress);

      var ticking = false;
      var onScroll = function () {
        ticking = false;
        var y = window.scrollY;
        if (!header.classList.contains('is-stuck')) spacer.style.height = header.offsetHeight + 'px';
        header.classList.toggle('is-stuck', y > 140);
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
      }, { passive: true });
      onScroll();
    }

    // Carrossel de ativos da Home
    var carousel = document.querySelector('.hero-carousel');
    if (carousel) initCarousel(carousel);

    if (reduce || !('IntersectionObserver' in window)) return;

    // Entrada do hero, em sequência
    var h1 = hero && hero.querySelector('h1');
    if (h1) {
      var col = h1.parentElement;
      var items = Array.prototype.slice.call(col.children);
      Array.prototype.forEach.call(col.parentElement.children, function (el) { if (el !== col) items.push(el); });
      Array.prototype.forEach.call(hero.children, function (el) {
        if (el !== header && !el.contains(h1) && el.className !== 'header-spacer') items.push(el);
      });
      items.forEach(function (el, i) {
        el.classList.add('hero-item');
        el.style.animationDelay = (0.12 + i * 0.1).toFixed(2) + 's';
      });
    }
    if (hero) hero.classList.add('hero-ready');

    // Revelação ao rolar: títulos, textos, cartões e colunas do rodapé
    var selector = [
      '.page > section:not(.hero) h2',
      '.page > section:not(.hero) p',
      '.page > section:not(.hero) [style*="display: grid"] > *',
      '.page > section:not(.hero) span[style*="text-transform: uppercase"]',
      '.page > section:not(.hero) img',
      '.page > footer [style*="display: grid"] > *',
      '.page > footer [style*="border-top"]'
    ].join(',');
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    var targets = [];
    document.querySelectorAll(selector).forEach(function (el) {
      for (var p = el.parentElement; p; p = p.parentElement) if (targets.indexOf(p) >= 0) return;
      targets.push(el);
    });
    targets.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentElement.children, function (s) { return targets.indexOf(s) >= 0; });
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(siblings.indexOf(el), 5) * 0.08).toFixed(2) + 's';
      revealIO.observe(el);
    });

    // Números que contam até o valor final (ex.: "+2,2 Bi", "R$ 510 M")
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); countIO.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('.page span[style*="font-size: 60px"]').forEach(function (el) {
      var node = el.firstChild;
      if (!node || node.nodeType !== 3) return;
      var m = node.nodeValue.match(/^(\D*?)(\d+(?:,\d+)?)(.*)$/);
      if (!m) return;
      el._count = { node: node, pre: m[1], to: parseFloat(m[2].replace(',', '.')), dec: (m[2].split(',')[1] || '').length, post: m[3] };
      node.nodeValue = m[1] + (0).toFixed(el._count.dec).replace('.', ',') + m[3];
      countIO.observe(el);
    });
    function countUp(el) {
      var c = el._count, t0 = performance.now(), dur = 1300;
      (function step(t) {
        var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
        c.node.nodeValue = c.pre + (c.to * e).toFixed(c.dec).replace('.', ',') + c.post;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }

    // Transição suave entre páginas do site
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var href = a.getAttribute('href');
      if (!/^[\w-]+\.html(#.*)?$/.test(href) || a.target) return;
      if (href.split('#')[0] === location.pathname.split('/').pop() && href.indexOf('#') >= 0) return;
      e.preventDefault();
      document.body.classList.add('is-leaving');
      setTimeout(function () { location.href = href; }, 280);
    });
    window.addEventListener('pageshow', function () { document.body.classList.remove('is-leaving'); });
  });

  // Carrossel: troca a cada 7 s. O tempo é a animação de preenchimento do ponto
  // ativo, então pausar a animação (hover, foco, fora da tela) pausa o carrossel,
  // e quem prefere menos movimento navega só pelas setas, pontos e miniaturas.
  function initCarousel(root) {
    var photos = Array.prototype.slice.call(root.querySelectorAll('.slide-photo'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.slide-dot'));
    var thumbs = Array.prototype.slice.call(root.querySelectorAll('.slide-thumb'));
    var count = root.querySelector('.slide-count');
    var name = root.querySelector('.slide-name');
    var place = root.querySelector('.slide-place');
    var total = photos.length, current = 0;
    if (total < 2) return;

    function show(index) {
      current = (index + total) % total;
      var photo = photos[current];
      photos.forEach(function (p, i) { p.classList.toggle('is-active', i === current); });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
        d.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
      [name, place, count].forEach(function (el) { el.classList.add('is-changing'); });
      setTimeout(function () {
        name.textContent = photo.dataset.name;
        place.textContent = photo.dataset.place;
        count.textContent = (current + 1 < 10 ? '0' : '') + (current + 1);
        [name, place, count].forEach(function (el) { el.classList.remove('is-changing'); });
      }, 280);
      // Miniaturas fixas (uma por ativo, sempre na mesma ordem): só a ativa muda
      thumbs.forEach(function (t) {
        var active = +t.dataset.index === current;
        t.classList.toggle('is-active', active);
        if (active) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
      });
    }

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { show(i); });
      d.addEventListener('animationend', function () { if (i === current) show(current + 1); });
    });
    thumbs.forEach(function (t) { t.addEventListener('click', function () { show(+t.dataset.index); }); });
    root.querySelector('.slide-prev').addEventListener('click', function () { show(current - 1); });
    root.querySelector('.slide-next').addEventListener('click', function () { show(current + 1); });

    // Deslizar no celular
    var startX = null;
    root.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
      startX = null;
    });

    // Pausa quando o carrossel sai da tela ou a aba fica em segundo plano
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        root.classList.toggle('is-offscreen', !entries[0].isIntersecting);
      }, { threshold: 0.25 }).observe(root);
    }
    document.addEventListener('visibilitychange', function () { root.classList.toggle('is-hidden', document.hidden); });

    // A primeira foto já vem ativa no HTML, então não haveria transição: tira a
    // classe e devolve depois que a imagem carregar, para a aproximação lenta
    // (Ken Burns) acontecer também nela.
    var first = photos[0];
    first.style.transition = 'none';
    first.classList.remove('is-active');
    void first.offsetWidth;
    first.style.transition = '';
    // Se o visitante já escolheu outro ativo enquanto a foto carregava, respeita a escolha
    (first.decode ? first.decode() : Promise.resolve()).catch(function () {}).then(function () {
      requestAnimationFrame(function () {
        if (!photos.some(function (p) { return p.classList.contains('is-active'); })) show(current);
      });
    });
  }
})();
