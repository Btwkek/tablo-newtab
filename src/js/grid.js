/** Сетка плиток, папки и перетаскивание. */

import { S, save } from './state.js';
import { emit } from './events.js';
import { t } from './i18n.js';
import { editSite, iconElement, openSite, showSiteMenu } from './sites.js';
import { $, svgDataUri, uid } from './util.js';

const FOLDER_ICON = svgDataUri(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M4 11a3 3 0 0 1 3-3h9l3 4h14a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#9a7bd6"/></svg>'
);

let draggedId = null;
let openFolderId = null;

/* ---- Поиск и раскладка по ячейкам ---- */

function findItem(id) {
  for (const tile of S.tiles) {
    if (tile.id === id) return { item: tile, list: S.tiles };
    for (const child of tile.items ?? []) if (child.id === id) return { item: child, list: tile.items };
  }
  return null;
}

/**
 * Возвращает массив ячеек: плитка или null для свободного места.
 * У плитки без номера ячейки (slot) он назначается по порядку.
 */
function cellsOf(list, minRows) {
  const columns = S.opts.columns;
  const used = new Map();
  const loose = [];
  for (const tile of list) {
    if (Number.isInteger(tile.slot) && tile.slot >= 0 && !used.has(tile.slot)) used.set(tile.slot, tile);
    else loose.push(tile);
  }
  let next = 0;
  for (const tile of loose) {
    while (used.has(next)) next++;
    tile.slot = next;
    used.set(next, tile);
  }
  const highest = Math.max(-1, ...used.keys()) + 1;
  const total = Math.max(columns * minRows, Math.ceil((highest + 1) / columns) * columns);
  return Array.from({ length: total }, (_, index) => used.get(index) ?? null);
}

/* ---- Перетаскивание ---- */

const endDrag = () => {
  draggedId = null;
  document.body.classList.remove('dragging');
};
// Элемент-источник может исчезнуть при перерисовке, поэтому слушаем на документе.
document.addEventListener('dragend', endDrag, true);
document.addEventListener('drop', () => document.body.classList.remove('dragging'), true);

/** Левый и правый край плитки меняют порядок, центр кладёт внутрь или создаёт папку. */
function dropZone(element, event) {
  const rect = element.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  return x < 0.25 ? 'before' : x > 0.75 ? 'after' : 'merge';
}

function moveItem(sourceId, target, list, zone, slot) {
  const source = sourceId && findItem(sourceId);
  if (!source || source.item === target) return;

  const item = source.item;
  const toMain = list === S.tiles;
  if (item.type === 'folder' && !toMain) return;

  const sameList = source.list === list;
  const oldSlot = item.slot;
  source.list.splice(source.list.indexOf(item), 1);

  // Если из папки вынули последний сайт, папка исчезает.
  if (source.list !== S.tiles && !source.list.length) {
    const folder = S.tiles.find(tile => tile.items === source.list);
    if (folder) {
      S.tiles.splice(S.tiles.indexOf(folder), 1);
      if (openFolderId === folder.id) closeFolder();
    }
  }

  if (zone === 'merge' && target && toMain && item.type === 'site') {
    delete item.slot;
    if (target.type === 'folder') {
      target.items.push(item);
    } else {
      const folder = { id: uid(), type: 'folder', title: t('folder'), slot: target.slot, items: [target, item] };
      delete target.slot;
      list[list.indexOf(target)] = folder;
    }
  } else if (target) {
    // Край плитки: меняем местами.
    if (sameList && Number.isInteger(oldSlot) && Number.isInteger(target.slot)) {
      item.slot = target.slot;
      target.slot = oldSlot;
    } else {
      delete item.slot;
    }
    list.push(item);
  } else {
    // Свободная ячейка: встаём именно в неё.
    item.slot = slot;
    list.push(item);
  }

  save();
  emit('render');
}

/* ---- Элементы ---- */

function buildFolderPreview(folder) {
  const preview = document.createElement('div');
  preview.className = 'folder-preview';
  const count = folder.items.length;
  const shown = count > 4 ? 3 : count;
  for (let i = 0; i < 4; i++) {
    const cell = document.createElement('div');
    if (i < shown) cell.append(iconElement(folder.items[i]));
    else if (i === 3 && count > 4) cell.textContent = '+' + (count - 3);
    else cell.style.visibility = 'hidden';
    preview.append(cell);
  }
  return preview;
}

function tileElement(item, list) {
  const isFolder = item.type === 'folder';
  const element = document.createElement('div');
  element.className = 'tile' + (isFolder ? ' folder' : '') + (item.dark ? ' light-text' : '');
  element.draggable = true;
  element.dataset.id = item.id;
  element.title = item.title || '';

  if (isFolder && !S.opts.showFolderIcons) {
    element.classList.add('plain');
    const icon = document.createElement('img');
    icon.src = FOLDER_ICON;
    const label = document.createElement('span');
    label.textContent = item.title;
    element.append(icon, label);
  } else if (isFolder) {
    element.append(buildFolderPreview(item));
    if (item.blur) {
      element.classList.add('blurred');
      element.style.setProperty('--folder-blur', item.blur + 'px');
    }
  } else {
    if (item.bg) element.style.background = item.bg;
    element.append(iconElement(item));
    if (!item.wide) {
      const label = document.createElement('span');
      label.textContent = item.title;
      element.append(label);
    }
  }

  element.onclick = event => (isFolder ? openFolder(item.id) : openSite(item.url, event));
  element.onauxclick = event => {
    if (event.button === 1 && item.url) { event.preventDefault(); window.open(item.url, '_blank'); }
  };
  element.oncontextmenu = event => showSiteMenu(event, item, list);

  element.ondragstart = event => {
    draggedId = item.id;
    element.classList.add('dragging');
    document.body.classList.add('dragging');
    event.dataTransfer.setData('text/plain', item.id);
  };
  element.ondragover = event => {
    event.preventDefault();
    element.dataset.zone = dropZone(element, event);
    element.classList.add('over');
  };
  element.ondragleave = () => {
    element.classList.remove('over');
    delete element.dataset.zone;
  };
  element.ondrop = event => {
    event.preventDefault();
    event.stopPropagation();
    element.classList.remove('over');
    moveItem(draggedId, item, list, dropZone(element, event));
  };
  return element;
}

function emptyElement(list, slot) {
  const element = document.createElement('div');
  element.className = 'tile empty';
  element.textContent = '+';
  element.onclick = () => editSite({ type: 'site', slot }, list, true);
  element.ondragover = event => {
    event.preventDefault();
    element.classList.add('over');
    element.dataset.zone = 'merge';
  };
  element.ondragleave = () => {
    element.classList.remove('over');
    delete element.dataset.zone;
  };
  element.ondrop = event => {
    event.preventDefault();
    event.stopPropagation();
    moveItem(draggedId, null, list, null, slot);
  };
  return element;
}

function fillGrid(container, list, minRows) {
  container.replaceChildren();
  cellsOf(list, minRows).forEach((item, slot) => container.append(item ? tileElement(item, list) : emptyElement(list, slot)));
}

export function renderGrid() {
  fillGrid($('#grid'), S.tiles, 2);
}

/* ---- Папка ---- */

export function openFolder(id) {
  openFolderId = id;
  $('#folder-overlay').hidden = false;
  renderFolder();
}

export function closeFolder() {
  openFolderId = null;
  $('#folder-overlay').hidden = true;
}

export function renderFolder() {
  if (!openFolderId) return;
  const found = findItem(openFolderId);
  if (!found) return closeFolder();

  const folder = found.item;
  const grid = $('#folder-grid');
  $('#folder-title').value = folder.title;
  fillGrid(grid, folder.items, 1);
}

$('#folder-title').onchange = event => {
  const found = findItem(openFolderId);
  if (!found) return;
  found.item.title = event.target.value || t('folder');
  save();
};

$('#folder-overlay').onclick = event => {
  if (event.target.id === 'folder-overlay') closeFolder();
};

// Сайт, брошенный на затемнённый фон за окном папки, возвращается на главную.
$('#folder-overlay').ondragover = event => event.preventDefault();
$('#folder-overlay').ondrop = event => {
  if (event.target.id !== 'folder-overlay') return;
  event.preventDefault();
  moveItem(draggedId, null, S.tiles);
};
