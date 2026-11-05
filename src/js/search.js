/** Строка поиска: адрес открывается напрямую, остальное уходит в поисковик. */

import { SEARCH_ENGINES } from './config.js';
import { S } from './state.js';
import { getLanguage } from './i18n.js';
import { $, normalizeUrl } from './util.js';

const looksLikeUrl = text =>
  /^[a-z][a-z0-9+.-]*:\/\//i.test(text) || /^[^\s/]+\.[^\s/.]{2,}(\/\S*)?$/.test(text);

async function runSearch(query) {
  if (looksLikeUrl(query)) { location.href = normalizeUrl(query); return; }

  const base = SEARCH_ENGINES[S.opts.searchEngine];
  if (!base) {
    try { return await browser.search.search({ query, disposition: 'CURRENT_TAB' }); } catch { /* запасной вариант ниже */ }
  }
  location.href = (base || SEARCH_ENGINES.google) + encodeURIComponent(query);
}

export function initSearch() {
  $('#search-input').onkeydown = event => {
    if (event.key !== 'Enter') return;
    const query = event.target.value.trim();
    if (query) runSearch(query);
  };

  $('#search-image').onclick = () => { location.href = `https://www.google.com/imghp?hl=${getLanguage()}`; };

  // Клавиша «/» переводит фокус в строку поиска.
  document.addEventListener('keydown', event => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName ?? '');
    if (event.key === '/' && !typing && !document.querySelector('dialog[open]')) {
      event.preventDefault();
      $('#search-input').focus();
    }
  });
}
