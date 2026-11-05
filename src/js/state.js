/** Состояние приложения и его хранение. */

import { STATE_KEY, STATE_VERSION, WIDGET_TYPES, SEARCH_ENGINES, defaultOptions, defaultPills, migrateOptions } from './config.js';
import { emit } from './events.js';
import { setLanguage } from './i18n.js';

const hasExtensionStorage = typeof browser !== 'undefined' && Boolean(browser.storage);

// Вне расширения (например, при отладке в обычной вкладке) данные лежат в localStorage.
const store = hasExtensionStorage
  ? browser.storage.local
  : {
      get: async key => ({ [key]: JSON.parse(localStorage.getItem(key) || 'null') }),
      set: async values => { for (const key in values) localStorage.setItem(key, JSON.stringify(values[key])); }
    };

/**
 * Единственный объект состояния. Его никогда не заменяют целиком,
 * а обновляют через setState, поэтому импортированная ссылка всегда актуальна.
 */
export const S = {
  bg: null,          // фон-картинка (data URL) или null
  opts: defaultOptions(),
  pills: defaultPills(),
  tiles: [],         // плитки и папки главной сетки
  widgets: [],
  layout: {},        // смещения блоков в режиме правки: { имяБлока: [x, y] }
  hidden: []         // адреса закладок, удалённых с плиток
};

/** Приводит произвольные сохранённые данные к актуальному виду. */
export function normalize(raw = {}) {
  const opts = { ...defaultOptions(), ...migrateOptions(raw.opts), v: STATE_VERSION };
  setLanguage(opts.language); // до defaultPills(): названия быстрых ссылок зависят от языка
  if ((raw.opts?.v ?? 0) < 5) {
    // Стандартные значки вкладки поменялись: эмодзи-сердечко вместо градиента и домика.
    if (opts.tabIcon === 'bg') opts.tabIcon = 'emoji';
    if (opts.tabEmoji === '🏠') opts.tabEmoji = '❤️';
  }
  if (opts.searchEngine !== 'browser' && !SEARCH_ENGINES[opts.searchEngine]) opts.searchEngine = 'browser';
  return {
    bg: raw.bg ?? null,
    opts,
    pills: Array.isArray(raw.pills) ? raw.pills : defaultPills(),
    tiles: raw.tiles ?? [],
    widgets: (raw.widgets ?? [])
      .filter(widget => WIDGET_TYPES.includes(widget.type))
      .map(({ c: legacyColor, ...widget }) => ({ ...widget, color: widget.color ?? 'auto' })),
    layout: raw.layout ?? {},
    hidden: raw.hidden ?? []
  };
}

export function setState(raw) {
  Object.assign(S, normalize(raw));
}

/** Загружает состояние. Возвращает false, если это первый запуск. */
export async function loadState() {
  const saved = (await store.get(STATE_KEY))[STATE_KEY];
  setState(saved ?? {});
  return Boolean(saved);
}

export async function reloadState() {
  const saved = (await store.get(STATE_KEY))[STATE_KEY];
  if (saved) setState(saved);
}

export function save() {
  const done = store.set({ [STATE_KEY]: S });
  emit('saved');
  return done;
}

/** Вызывает handler, когда другая вкладка изменила данные. */
export function onExternalChange(handler) {
  if (!hasExtensionStorage) return;
  browser.storage.onChanged.addListener((changes, area) => {
    const change = changes[STATE_KEY];
    if (area === 'local' && change?.newValue) handler(change.newValue);
  });
}
