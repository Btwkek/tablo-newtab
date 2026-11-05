/** Экспорт и импорт настроек, плиток и виджетов в JSON. */

import { WIDGET_TYPES, defaultOptions, defaultPills, migrateOptions } from './config.js';
import { S, save, setState } from './state.js';
import { emit } from './events.js';
import { openModal, toast } from './ui.js';
import { t } from './i18n.js';
import { $, h, sameJson } from './util.js';

const SECTIONS = ['opts', 'pills', 'widgets', 'layout', 'bg'];

/** Настройки, отличающиеся от стандартных. */
function changedOptions() {
  const defaults = defaultOptions();
  const changed = {};
  for (const key in defaults) {
    if (key !== 'v' && !sameJson(S.opts[key], defaults[key])) changed[key] = S.opts[key];
  }
  return changed;
}

/** Собирает данные для экспорта: только выбранные и непустые разделы. Плитки не входят: их берут из закладок. */
function buildExport(selected) {
  const out = { tablo: 1 };
  const opts = changedOptions();
  if (selected.opts && Object.keys(opts).length) out.opts = opts;
  if (selected.pills && !sameJson(S.pills.map(p => p.url), defaultPills().map(p => p.url))) out.pills = S.pills;
  if (selected.widgets && S.widgets.length) out.widgets = S.widgets;
  if (selected.layout && Object.keys(S.layout).length) out.layout = S.layout;
  if (selected.bg && S.bg) out.bg = S.bg;
  return out;
}

function applyImport(text, replace) {
  let data;
  try { data = JSON.parse(text); } catch { return toast(t('data.badJson')); }

  const known = data && typeof data === 'object' && (data.opts || data.tiles || data.widgets || data.pills || data.layout || data.bg);
  if (!known) return toast(t('data.notTablo'));

  // Без замены добавляются только элементы, которых ещё нет.
  const merge = (current, incoming) => {
    if (replace) return incoming;
    const have = new Set(current.map(item => item.id));
    return current.concat(incoming.filter(item => !have.has(item.id)));
  };

  if (data.opts) Object.assign(S.opts, migrateOptions(data.opts));
  if (data.pills) S.pills = data.pills;
  if (data.layout) S.layout = data.layout;
  if (data.bg) S.bg = data.bg;
  if (data.tiles) S.tiles = merge(S.tiles, data.tiles);
  if (data.widgets) S.widgets = merge(S.widgets, data.widgets.filter(w => WIDGET_TYPES.includes(w.type)));
  if (data.hidden) S.hidden = [...new Set([...S.hidden, ...data.hidden])];

  setState(S);
  save();
  emit('render');
  emit('weather:refresh');
  toast(t('data.applied'));
}

export function openDataDialog() {
  const selected = { opts: 1, pills: 1, widgets: 1, layout: 1, bg: 0 };
  const text = h('textarea', { id: 'data-text', rows: 9, spellcheck: 'false' });
  const replace = h('input', { type: 'checkbox', id: 'data-replace' });
  const button = (action, label, cls = '') => h('button', { type: 'button', class: cls, dataset: { action } }, label);

  const dialog = openModal(
    h('h3', {}, t('data.title')),
    h('p', { class: 'hint' }, t('data.hint')),
    h('div', { class: 'checks' }, SECTIONS.map(key =>
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: Boolean(selected[key]), dataset: { section: key } }), ' ' + t('data.' + key))
    )),
    text,
    h('label', { class: 'check' }, replace, ' ' + t('data.replace')),
    h('div', { class: 'buttons wrap' },
      button('copy', t('data.copy')),
      button('download', t('data.download')),
      button('upload', t('data.upload')),
      button('apply', t('data.apply'), 'primary'),
      button('close', t('common.close'))
    )
  );

  const refresh = () => { text.value = JSON.stringify(buildExport(selected), null, 1); };
  refresh();

  dialog.onchange = event => {
    const section = event.target.dataset.section;
    if (!section) return;
    selected[section] = event.target.checked ? 1 : 0;
    refresh();
  };

  dialog.onclick = async event => {
    const action = event.target.dataset.action;
    if (action === 'close') dialog.close();
    if (action === 'apply') applyImport(text.value, replace.checked);
    if (action === 'upload') $('#import-file').click();
    if (action === 'copy') {
      try { await navigator.clipboard.writeText(text.value); } catch { text.select(); document.execCommand('copy'); }
      toast(t('data.copied'));
    }
    if (action === 'download') {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([text.value], { type: 'application/json' }));
      link.download = `tablo-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
    }
  };
}

export function initDataIo() {
  $('#import-file').onchange = event => {
    const file = event.target.files[0];
    if (!file) return;
    file.text().then(content => {
      const field = $('#data-text');
      if (field) field.value = content;
      applyImport(content, Boolean($('#data-replace')?.checked));
    });
    event.target.value = '';
  };
}
