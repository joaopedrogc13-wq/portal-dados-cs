/**
 * Portal de Inteligência de Dados — Cabral & Sousa
 * Branding: #E8000A (vermelho C&S) + branco + preto | Inter + JetBrains Mono
 * script.js — Interatividade e pontos de integração Oracle/Winthor
 *
 * Estrutura:
 *   1. Relógio em tempo real
 *   2. Ticker de alertas com fade automático
 *   3. Smooth scroll para âncoras
 *   4. IntersectionObserver — animação dos cards
 *   5. Skeleton loader nos KPIs
 *   6. Timestamps dos cards
 *   7. [ORACLE INTEGRATION POINTS] — onde substituir dados estáticos
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   1. RELÓGIO EM TEMPO REAL
   Atualiza a cada 1 segundo com hora e data em PT-BR.
═══════════════════════════════════════════════════════════════ */
(function initClock() {
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');

  if (!timeEl || !dateEl) return;

  function updateClock() {
    const now = new Date();

    // Hora no formato HH:MM:SS
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    timeEl.textContent = `${h}:${m}:${s}`;

    // Data no formato DD/MM/AAAA
    const d   = String(now.getDate()).padStart(2, '0');
    const mo  = String(now.getMonth() + 1).padStart(2, '0');
    const y   = now.getFullYear();
    dateEl.textContent = `${d}/${mo}/${y}`;
  }

  updateClock(); // Executa imediatamente para evitar flash de "--"
  setInterval(updateClock, 1000);
})();


/* ═══════════════════════════════════════════════════════════════
   2. TICKER DE ALERTAS
   Rotaciona mensagens a cada 5 segundos com transição suave.
═══════════════════════════════════════════════════════════════ */
(function initTicker() {
  const msgEl = document.getElementById('ticker-msg');
  if (!msgEl) return;

  /*
   * [ORACLE INTEGRATION POINT — ALERTAS]
   * Substituir array abaixo por chamada à API:
   * fetch('/api/alertas')
   *   .then(r => r.json())
   *   .then(data => { messages = data.alertas; })
   */
  const messages = [
    '✅ Sistema online — Dados sincronizados com Winthor/Oracle',
    '📈 Faturamento do mês em linha com a meta PCMETA',
    '⚠️ Atenção: Margem do setor de Compras abaixo do threshold',
    '🚀 C&S 50 Anos — Novo portal de dados disponível',
  ];

  let current = 0;

  function showNext() {
    current = (current + 1) % messages.length;
    msgEl.style.animation = 'none';
    // Força reflow para reiniciar a animação
    void msgEl.offsetWidth;
    msgEl.textContent = messages[current];
    msgEl.style.animation = '';
  }

  setInterval(showNext, 5000);
})();


/* ═══════════════════════════════════════════════════════════════
   3. SMOOTH SCROLL PARA ÂNCORAS
   Intercepta cliques em links do tipo href="#..." e
   realiza rolagem suave até o elemento de destino.
═══════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href').slice(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    e.preventDefault();

    const headerH = document.querySelector('.site-header')?.offsetHeight || 68;
    const targetY = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

    window.scrollTo({ top: targetY, behavior: 'smooth' });
  });
})();


/* ═══════════════════════════════════════════════════════════════
   4. INTERSECTIONOBSERVER — ANIMAÇÃO DOS CARDS AO ENTRAR NA VIEWPORT
   Cada .kpi-card e .timeline-item recebe a classe "visible"
   com stagger de 100ms por elemento.
═══════════════════════════════════════════════════════════════ */
(function initScrollAnimations() {
  // Verifica suporte
  if (!('IntersectionObserver' in window)) {
    // Fallback: mostra todos imediatamente
    document.querySelectorAll('.kpi-card, .timeline-item').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  // KPI cards — stagger via CSS transition-delay
  document.querySelectorAll('.kpi-card').forEach(function (card, i) {
    card.style.transition = `opacity 0.55s ease ${i * 0.08}s, transform 0.55s ease ${i * 0.08}s`;
    observer.observe(card);
  });

  // Timeline items
  document.querySelectorAll('.timeline-item').forEach(function (item) {
    item.style.opacity = '0';
    item.style.transform = 'translateY(16px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(item);
  });
})();


/* ═══════════════════════════════════════════════════════════════
   5. SKELETON LOADER NOS KPIs
   Simula carregamento dos dados por 1,2s antes de revelar
   os valores. Em produção, substituir pela chamada fetch() real.
═══════════════════════════════════════════════════════════════ */
(function initSkeletonLoader() {
  const targets = document.querySelectorAll('.skeleton-target');
  if (!targets.length) return;

  // Salva os valores originais e aplica skeleton
  const originalValues = new Map();
  targets.forEach(function (el) {
    originalValues.set(el, el.textContent);
    el.classList.add('skeleton');
  });

  /*
   * [ORACLE INTEGRATION POINT — DADOS DOS KPIs]
   *
   * Substituir o setTimeout abaixo pelas chamadas reais à API:
   *
   * Promise.all([
   *   fetch('/api/winthor/K_VENDA?periodo=mes_atual'),
   *   fetch('/api/financeiro/pmr'),
   *   fetch('/api/logistica/order-fill-rate'),
   *   fetch('/api/rh/turnover'),
   *   fetch('/api/operacoes/produtividade'),
   *   fetch('/api/compras/ruptura'),
   * ])
   * .then(responses => Promise.all(responses.map(r => r.json())))
   * .then(([vendas, fin, log, rh, ops, compras]) => {
   *   updateKPI('vendas',    formatCurrency(vendas.total_faturamento));
   *   updateKPI('financeiro', fin.pmr + ' dias');
   *   updateKPI('logistica',  log.order_fill_rate + '%');
   *   updateKPI('rh',         rh.turnover + '%');
   *   updateKPI('operacoes',  ops.produtividade + ' un/h');
   *   updateKPI('compras',    compras.ruptura + '%');
   * })
   * .catch(err => console.error('[Portal C&S] Erro ao carregar KPIs:', err));
   *
   * Remover o setTimeout quando a integração estiver ativa.
   */
  setTimeout(function () {
    targets.forEach(function (el) {
      el.classList.remove('skeleton');
      el.textContent = originalValues.get(el);
    });
    updateTimestamps();
  }, 1200);
})();


/* ═══════════════════════════════════════════════════════════════
   6. TIMESTAMPS DOS CARDS
   Preenche os campos "Atualizado:" com a hora atual ao carregar.
═══════════════════════════════════════════════════════════════ */
function updateTimestamps() {
  const now = new Date();
  const d  = String(now.getDate()).padStart(2, '0');
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const y  = now.getFullYear();
  const h  = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ts = `${d}/${mo}/${y} ${h}:${mi}`;

  document.querySelectorAll('.footer-time').forEach(function (el) {
    el.textContent = `Atualizado: ${ts}`;
  });
}


/* ═══════════════════════════════════════════════════════════════
   7. UTILITÁRIOS DE FORMATAÇÃO
   Funções auxiliares para uso com a integração Oracle.
═══════════════════════════════════════════════════════════════ */

/**
 * Formata um número como moeda brasileira (R$ 1,5M / R$ 487)
 * @param {number} value
 * @returns {string}
 */
function formatCurrency(value) {
  if (value >= 1_000_000) {
    return 'R$ ' + (value / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  }
  if (value >= 1_000) {
    return 'R$ ' + (value / 1_000).toFixed(1).replace('.', ',') + 'K';
  }
  return 'R$ ' + value.toFixed(0).replace('.', ',');
}

/**
 * Formata um percentual com casas decimais.
 * @param {number} value
 * @returns {string}
 */
function formatPercent(value) {
  return value.toFixed(1).replace('.', ',') + '%';
}

/**
 * Atualiza o texto de um KPI pelo atributo data-sector.
 * @param {string} sector
 * @param {string} value
 */
function updateKPI(sector, value) {
  const el = document.querySelector(`.skeleton-target[data-sector="${sector}"]`);
  if (el) el.textContent = value;
}

// Expõe utilitários no escopo global para uso eventual em console/debug
window.CSPortal = { formatCurrency, formatPercent, updateKPI, updateTimestamps };


/* ═══════════════════════════════════════════════════════════════
   8. INDICADOR DE HEADER ATIVO NO SCROLL
   Destaca o link de navegação correspondente à seção visível.
═══════════════════════════════════════════════════════════════ */
(function initActiveNav() {
  const sections = ['inicio', 'setores', 'sobre'];
  const navLinks = document.querySelectorAll('.nav-link');
  if (!navLinks.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(function (link) {
          const href = link.getAttribute('href').replace('#', '');
          link.style.color = (href === id) ? 'var(--accent-gold)' : '';
        });
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(function (id) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();
