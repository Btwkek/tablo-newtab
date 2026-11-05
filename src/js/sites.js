/** Сайты: значки, открытие, диалог добавления и контекстное меню. */

import { S, save } from './state.js';
import { emit } from './events.js';
import { showMenu, toast } from './ui.js';
import { t } from './i18n.js';
import { pickColor } from './eyedropper.js';
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
  const sites = item.type === 'folder' ? item.items : [item];
  // src — адрес исходной закладки: его могли поправить в диалоге правки, а закладка осталась прежней.
  const urls = sites.flatMap(site => [site.url, site.src]).filter(Boolean);
  S.hidden = [...new Set([...(S.hidden || []), ...urls])];
}

export function siteMenu(item, list) {
  const items = [
    [t('item.edit'), () => editSite(item, list, false)],
    [t('item.delete'), () => {
      if (list !== S.pills) hideUrls(item);
      list.splice(list.indexOf(item), 1);
      // Из папки убрали последний сайт: пустая папка не нужна (и не должна жить в зеркале).
      if (list !== S.tiles && list !== S.pills && !list.length) {
        const folder = S.tiles.find(tile => tile.items === list);
        if (folder) S.tiles.splice(S.tiles.indexOf(folder), 1);
      }
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

/** Режим заливки плитки: default (как в настройках), icon, color (свой цвет) или none. */
export const fillModeOf = item => item.fillMode || (item.bg ? 'color' : 'default');

let pickedIcon = null;
let colorTouched = false;
let strengthTouched = false;

/** Показывает только те поля заливки, которые нужны выбранному режиму. */
function syncFillRows() {
  const mode = $('#site-fill-mode').value;
  const auto = mode === 'default' || mode === 'icon';
  $('#fill-color-row').style.display = mode === 'color' ? '' : 'none';
  $('#fill-strength-row').style.display = auto ? '' : 'none';
  $('#fill-gradient-row').style.display = auto ? '' : 'none';
}

/** Переносит выбранные в диалоге параметры заливки в плитку. */
function saveFill(item) {
  const mode = $('#site-fill-mode').value;
  if (mode === 'default') delete item.fillMode;
  else item.fillMode = mode;

  if (mode === 'color') {
    if (colorTouched || !item.bg) { item.bg = $('#site-color').value; item.dark = false; }
  } else {
    delete item.bg;
    delete item.dark;
  }

  if (mode === 'default' || mode === 'icon') {
    if (strengthTouched) {
      const strength = Number($('#site-fill-strength').value);
      if (strength === S.opts.colorTilesStrength) delete item.fillStrength;
      else item.fillStrength = strength;
    }
    const gradient = $('#site-fill-gradient').value;
    if (gradient === 'default') delete item.gradient;
    else item.gradient = gradient === 'on';
  } else {
    delete item.fillStrength;
    delete item.gradient;
  }
}

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
  $('#fill-fields').style.display = isFolder || list === S.pills ? 'none' : '';
  $('#site-fill-mode').value = fillModeOf(item);
  $('#site-color').value = item.bg?.[0] === '#' ? item.bg : '#4a6cf7';
  $('#site-fill-strength').value = item.fillStrength ?? S.opts.colorTilesStrength;
  $('#site-fill-gradient').value = item.gradient === true ? 'on' : item.gradient === false ? 'off' : 'default';
  $('#site-icon').value = '';
  pickedIcon = null;
  colorTouched = false;
  strengthTouched = false;
  syncFillRows();
  dialog.showModal();

  $('#site-cancel').onclick = () => dialog.close();
  $('#site-color').oninput = () => { colorTouched = true; };
  $('#site-fill-strength').oninput = () => { strengthTouched = true; };
  $('#site-fill-mode').onchange = syncFillRows;
  $('#site-eyedropper').onclick = async () => {
    dialog.close(); // окно не должно закрывать то, с чего берётся цвет
    const color = await pickColor();
    dialog.showModal();
    if (!color) return;
    $('#site-color').value = color;
    colorTouched = true;
    $('#site-fill-mode').value = 'color';
    syncFillRows();
  };
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
      if (list !== S.pills) saveFill(item);
    }
    if (isNew) { item.id = uid(); list.push(item); }
    save();
    dialog.close();
    emit('render');
  };
}
