/** Мелкие общие функции без зависимостей. */

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/**
 * Создаёт элемент: h('div', { class: 'a', dataset: { id: 1 }, onclick: fn }, ...дети).
 * Дети — строки, элементы или массивы; null и false пропускаются.
 */
export function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  let value;
  for (const [key, val] of Object.entries(props ?? {})) {
    if (key === 'class') element.className = val;
    else if (key === 'dataset') Object.assign(element.dataset, val);
    else if (key === 'value') value = val;
    else if (key.startsWith('on')) element[key] = val;
    else if (val === true) element.setAttribute(key, '');
    else if (val !== false && val != null) element.setAttribute(key, val);
  }
  element.append(...children.flat().filter(child => child != null && child !== false));
  if (value !== undefined) element.value = value; // после детей, чтобы работало у <select>
  return element;
}

export const uid = () => Math.random().toString(36).slice(2, 9);

export const escapeHtml = text =>
  String(text).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

export const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/* ---- Адреса ---- */

export const hostOf = url => {
  try { return new URL(url).hostname; } catch { return ''; }
};

/** Добавляет https://, если у адреса нет схемы. */
export const normalizeUrl = value => (/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : 'https://' + value);

/** Запрещает адреса, исполняющие код (javascript:, data:, vbscript:). */
export const isSafeUrl = url => !/^\s*(javascript|data|vbscript):/i.test(url);

export const svgDataUri = markup => 'data:image/svg+xml;utf8,' + encodeURIComponent(markup);

/* ---- Цвет ---- */

export const hexToRgb = hex => {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};

/** Яркость цвета от 0 (чёрный) до 1 (белый). */
export const luminance = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
