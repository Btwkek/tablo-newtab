/** Сайты: значки, открытие, диалог добавления и контекстное меню. */

import { S, save } from './state.js';
import { emit } from './events.js';
import { showMenu, toast } from './ui.js';
import { t } from './i18n.js';
import { $, hostOf, isSafeUrl, normalizeUrl, uid } from './util.js';

/* ---- Значки ---- */

const faviconUrl = site => site.icon || `https://www.google.com/s2/favicons?domain=${hostOf(site.url)}&sz=64`;

function letterBadge(site) {
  const badge = document.createElement('div');
  badge.className = 'letter';
  badge.textContent = (site.title || '?')[0].toUpperCase();
  return badge;
}

export function iconElement(site) {
  if (!site.icon && !hostOf(site.url)) return letterBadge(site);
  const img = document.createElement('img');
  img.src = faviconUrl(site);
  if (site.wide) img.className = 'wide';
  img.onerror = () => img.replaceWith(letterBadge(site));
  return img;
}

/* ---- Открытие ---- */

export function openSite(url, event) {
  if (!isSafeUrl(url)) return toast(t('site.unsafeOpen'));
  if (S.opts.openInNewTab || event.ctrlKey || event.metaKey || event.button === 1) window.open(url, '_blank');
  else location.href = url;
}

/* ---- Удаление и скрытие ---- */

/** Запоминает адреса удалённой плитки, чтобы закладки не вернули её обратно. */
function hideUrls(item) {
  const urls = item.type === 'folder' ? item.items.map(i => i.url) : [item.url];
  S.hidden = (S.hidden || []).concat(urls);
}

export function siteMenu(item, list) {
  const items = [
    [t('item.edit'), () => editSite(item, list, false)],
    [t('item.delete'), () => {
      if (list !== S.pills) hideUrls(item);
      list.splice(list.indexOf(item), 1);
      save();
      emit('render');
    }]
  ];
  if (item.type === 'folder') items.unshift([t('item.addSite'), () => editSite({ type: 'site' }, item.items, true)]);
  return items;
}

export function showSiteMenu(event, item, list) {
  event.preventDefault();
  showMenu(event.clientX, event.clientY, siteMenu(item, list));
}

/* ---- Диалог добавления и изменения ---- */

let pickedIcon = null;
let colorTouched = false;

/** Открывает диалог для сайта или папки. isNew — добавить новый элемент в list. */
export function editSite(item, list, isNew) {
  const dialog = $('#site-dialog');
  const isFolder = item.type === 'folder';

  $('#site-dialog-title').textContent = t((isNew ? 'dialog.add' : 'dialog.edit') + (isFolder ? 'Folder' : 'Site'));
  $('#site-fields').style.display = isFolder ? 'none' : '';
  $('#folder-fields').style.display = isFolder ? '' : 'none';
  $('#folder-blur').value = item.blur || 0;
  $('#site-title').value = item.title || '';
  $('#site-url').value = item.url || '';
  $('#site-color').value = item.bg?.[0] === '#' ? item.bg : '#ffffff';
  $('#site-icon').value = '';
  pickedIcon = null;
  colorTouched = false;
  dialog.showModal();

  $('#site-cancel').onclick = () => dialog.close();
  $('#site-color').oninput = () => { colorTouched = true; };
  $('#site-icon').onchange = event => {
    const file = event.target.files[0];
    if (!file) return;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 64;
      canvas.getContext('2d').drawImage(image, 0, 0, 64, 64);
      pickedIcon = canvas.toDataURL('image/png');
    };
    image.src = URL.createObjectURL(file);
  };

  $('#site-save').onclick = () => {
    const title = $('#site-title').value.trim();
    const url = $('#site-url').value.trim();
    if (!isFolder && !url) return $('#site-url').focus();
    if (!isFolder && !isSafeUrl(normalizeUrl(url))) return toast(t('site.unsafeAdd'));

    item.title = title || hostOf(normalizeUrl(url)) || t('untitled');
    if (isFolder) {
      item.blur = Number($('#folder-blur').value);
    } else {
      item.url = normalizeUrl(url);
      if (pickedIcon) { item.icon = pickedIcon; item.wide = false; }
      if (colorTouched) { item.bg = $('#site-color').value; item.dark = false; }
    }
    if (isNew) { item.id = uid(); list.push(item); }
    save();
    dialog.close();
    emit('render');
  };
}
