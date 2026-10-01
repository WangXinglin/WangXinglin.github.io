(() => {
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.publication-card')];
  const count = document.querySelector('.result-count');
  const languageButtons = [...document.querySelectorAll('[data-language]')];
  const storageKey = 'xinglin-homepage-language';
  let language = 'en';
  let activeFilter = 'first';
  const copyLabels = {
    en: {idle: 'Copy', copied: 'Copied', selected: 'Selected · copy manually'},
    zh: {idle: '复制', copied: '已复制', selected: '已选中，请手动复制'}
  };

  function selectFilter(value) {
    activeFilter = value;
    let shown = 0;
    cards.forEach(card => {
      const show = value === 'all' || card.dataset.category === value;
      card.hidden = !show;
      if (show) shown++;
    });
    filters.forEach(button => {
      const selected = button.dataset.filter === value;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    count.textContent = language === 'zh'
      ? `${shown} 篇论文${value === 'first' ? ' · 含共同一作' : ''}`
      : `${shown} publication${shown === 1 ? '' : 's'}${value === 'first' ? ' · including co-first-authored work' : ''}`;
  }

  function setLanguage(value, persist = true) {
    language = value === 'zh' ? 'zh' : 'en';
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-en][data-zh]').forEach(node => {
      node.textContent = node.dataset[language];
    });
    for (const [suffix, attribute] of [['label', 'aria-label'], ['alt', 'alt'], ['title', 'title']]) {
      document.querySelectorAll(`[data-en-${suffix}][data-zh-${suffix}]`).forEach(node => {
        node.setAttribute(attribute, node.getAttribute(`data-${language}-${suffix}`));
      });
    }
    document.querySelectorAll('[data-only-lang]').forEach(node => {
      node.hidden = node.dataset.onlyLang !== language;
    });
    languageButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    document.querySelectorAll('.copy-btn').forEach(button => {
      button.textContent = copyLabels[language][button.dataset.copyState || 'idle'];
    });
    selectFilter(activeFilter);
    if (persist) {
      try { localStorage.setItem(storageKey, language); } catch { /* Storage may be disabled. */ }
    }
  }

  filters.forEach(button => button.addEventListener('click', () => selectFilter(button.dataset.filter)));
  languageButtons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
  try { language = localStorage.getItem(storageKey) === 'zh' ? 'zh' : 'en'; } catch { /* Default to English. */ }
  setLanguage(language, false);

  document.querySelectorAll('.copy-btn').forEach(button => {
    let resetTimer;
    button.addEventListener('click', async () => {
      const code = button.parentElement.querySelector('pre');
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.dataset.copyState = 'copied';
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
        button.dataset.copyState = 'selected';
      }
      button.textContent = copyLabels[language][button.dataset.copyState];
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        button.dataset.copyState = 'idle';
        button.textContent = copyLabels[language].idle;
      }, 2400);
    });
  });

  const links = [...document.querySelectorAll('.nav-links a')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin: '-15% 0px -70% 0px', threshold: 0});
    document.querySelectorAll('main > section').forEach(section => observer.observe(section));
  }
})();
