/** Закладки Firefox: импорт на плитки, слежение за изменениями и зеркало в папку «Табло» / «Tablo». */

import { MIRROR_FOLDER_NAMES, t } from './i18n.js';
import { S, reloadState, save } from './state.js';
import { emit, on } from './events.js';
import { toast } from './ui.js';
import { $, debounce, uid } from './util.js';

const hasBookmarksApi = () => typeof browser !== 'undefined' && Boolean(browser.bookmarks);

const ROOTS = {
  toolbar: ['toolbar_____'],
  all: ['toolbar_____', 'unfiled_____', 'menu________']
};

const isMirrorFolder = node => node.type === 'folder' && MIRROR_FOLDER_NAMES.includes(node.title);
const isSite = node => node.type === 'bookmark' && /^https?:/.test(node.url || '');
const siteFrom = node => ({ id: uid(), type: 'site', title: node.title, url: node.url, src: node.url });

/* ---- Импорт ---- */

/** Собирает закладки из выбранных корневых папок (и из папки-зеркала «Табло»). */
async function collectBookmarks() {
  const roots = [...(ROOTS[S.opts.bookmarkSource] ?? ROOTS.all)];
  const mirrorOnly = S.opts.mirrorBookmarks && !roots.includes('unfiled_____');
  if (mirrorOnly) roots.push('unfiled_____');

  const nodes = [];
  for (const root of roots) {
    let children;
    try { children = await browser.bookmarks.getChildren(root); } catch { continue; }
    for (const node of children) {
      if (isMirrorFolder(node)) nodes.push(...await browser.bookmarks.getChildren(node.id));
      else if (!(mirrorOnly && root === 'unfiled_____')) nodes.push(node);
    }
  }
  return nodes;
}

/** Добавляет на плитки новые закладки. Возвращает, сколько сайтов добавлено. */
export async function importBookmarks() {
  if (!hasBookmarksApi()) return 0;

  const hidden = new Set(S.hidden ?? []);
  const known = new Set();
  for (const tile of S.tiles) {
    for (const site of [tile, ...(tile.items ?? [])]) {
      if (site.url) known.add(site.url);
      if (site.src) known.add(site.src);
    }
  }
  const isNew = node => isSite(node) && !known.has(node.url) && !hidden.has(node.url);

  let added = 0;
  for (const node of await collectBookmarks()) {
    if (isSite(node)) {
      if (!isNew(node)) continue;
      S.tiles.push(siteFrom(node));
      known.add(node.url);
      added++;
    } else if (node.type === 'folder') {
      const fresh = (await browser.bookmarks.getChildren(node.id)).filter(isNew);
      if (!fresh.length) continue;

      const items = fresh.map(siteFrom);
      const existing =
        S.tiles.find(t => t.type === 'folder' && t.bmId === node.id) ||
        S.tiles.find(t => t.type === 'folder' && t.title === node.title);
      if (existing) {
        existing.bmId = node.id;
        existing.items.push(...items);
      } else {
        S.tiles.push({ id: uid(), type: 'folder', title: node.title || t('folder'), bmId: node.id, items });
      }
      fresh.forEach(child => known.add(child.url));
      added += fresh.length;
    }
  }
  return added;
}

async function syncFromBookmarks() {
  if (await importBookmarks()) {
    save();
    emit('render');
  }
}

/* ---- Слежение ---- */

let watching = false;
let mirrorBusy = false;

function watchBookmarks() {
  if (watching || !hasBookmarksApi()) return;
  watching = true;

  const sync = debounce(async () => {
    if (mirrorBusy) return;
    try { await reloadState(); await syncFromBookmarks(); } catch { /* повторим при следующем событии */ }
  }, 500);

  for (const event of ['onCreated', 'onChanged', 'onMoved', 'onRemoved']) browser.bookmarks[event].addListener(sync);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !document.querySelector('dialog[open]')) sync();
  });
}

/* ---- Зеркало плиток в закладки «Табло» ---- */

let mirrorSignature = '';

const mirrorSoon = debounce(async () => {
  // Пустой список не трогаем только на первом запуске: после удаления последней плитки зеркало нужно очистить.
  if (!S.opts.mirrorBookmarks || !hasBookmarksApi() || (!S.tiles.length && !S.hidden?.length)) return;

  const ordered = [...S.tiles].sort((a, b) => (a.slot ?? 1e9) - (b.slot ?? 1e9));
  const signature = JSON.stringify(
    ordered.map(t => (t.type === 'folder' ? [t.title, t.items.map(i => [i.title, i.url])] : [t.title, t.url]))
  );
  if (signature === mirrorSignature) return;

  mirrorBusy = true;
  try {
    const siblings = await browser.bookmarks.getChildren('unfiled_____');
    const root =
      siblings.find(isMirrorFolder) ||
      (await browser.bookmarks.create({ parentId: 'unfiled_____', title: t('mirrorFolder') }));

    for (const child of await browser.bookmarks.getChildren(root.id)) {
      if (child.type === 'folder') await browser.bookmarks.removeTree(child.id);
      else await browser.bookmarks.remove(child.id);
    }
    for (const tile of ordered) {
      if (tile.type === 'folder') {
        const folder = await browser.bookmarks.create({ parentId: root.id, title: tile.title });
        for (const item of tile.items) await browser.bookmarks.create({ parentId: folder.id, title: item.title, url: item.url });
      } else {
        await browser.bookmarks.create({ parentId: root.id, title: tile.title, url: tile.url });
      }
    }
    mirrorSignature = signature;
  } catch { /* зеркало не критично: попробуем при следующем сохранении */
  } finally {
    setTimeout(() => { mirrorBusy = false; }, 1500);
  }
}, 2000);

/** Принудительно пересобирает зеркало (например, после включения настройки). */
export function rebuildMirror() {
  mirrorSignature = '';
  mirrorSoon();
}

on('saved', mirrorSoon);

/* ---- Доступ к закладкам ---- */

/** Запрашивает разрешение. Вызывать прямо из обработчика клика, иначе Firefox не покажет окно. */
export async function requestBookmarkAccess() {
  try {
    const granted = await browser.permissions.request({ permissions: ['bookmarks'] });
    if (!granted) return toast(t('bm.denied'));
    const added = await importBookmarks();
    save();
    emit('render');
    $('#bookmark-prompt').hidden = true;
    watchBookmarks();
    toast(added ? t('bm.added', { n: added }) : t('bm.none'));
  } catch (error) {
    toast(t('bm.failed', { message: error.message }));
  }
}

export async function initBookmarks() {
  $('#bookmark-allow').onclick = requestBookmarkAccess;
  $('#bookmark-dismiss').onclick = () => {
    $('#bookmark-prompt').hidden = true;
    S.opts.bookmarkPromptDismissed = true;
    save();
  };

  let granted = false;
  try { granted = await browser.permissions.contains({ permissions: ['bookmarks'] }); } catch { /* вне расширения */ }

  if (granted) {
    watchBookmarks();
    try { await syncFromBookmarks(); } catch { /* закладки недоступны */ }
  } else if (!S.tiles.length && !S.opts.bookmarkPromptDismissed) {
    $('#bookmark-prompt').hidden = false;
  }
}

/** Только импорт, без разрешений: используется после смены источника закладок. */
export const importNow = () => syncFromBookmarks().catch(() => {});
