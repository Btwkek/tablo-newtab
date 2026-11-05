/** Панель настроек. Поля описаны данными, разметка собирается по описанию. */

import { THEMES, defaultOptions } from './config.js';
import { S, save } from './state.js';
import { emit, on } from './events.js';
import { importNow, rebuildMirror } from './bookmarks.js';
import { openDataDialog } from './dataio.js';
import { t } from './i18n.js';
import { $, h, sameJson } from './util.js';

/* ---- Описание полей ---- */

const select = (key, choices) => ({ type: 'select', key, choices });
const range = (key, min, max, step = 1) => ({ type: 'range', key, min, max, step });
const check = key => ({ type: 'check', key });
const color = key => ({ type: 'color', key });
const text = (key, placeholder = '') => ({ type: 'text', key, placeholder });

// Подписи берутся из словаря: заголовок раздела — 'sec.<id>', поле — 'opt.<ключ настройки>',
// пункты списков — ключи словаря, плейсхолдеры — ключи 'ph.*' (или готовый текст).

const themeChoices = [
  ['auto', 'choice.themeAuto'],
  ['random', 'choice.themeRandom'],
  ...Object.keys(THEMES).map(id => [id, 'theme.' + id]),
  ['custom', 'choice.themeCustom']
];

const SECTIONS = [
  { id: 'language', fields: [
    select('language', [['auto', 'choice.langAuto'], ['ru', 'Русский'], ['en', 'English']])
  ] },
  { id: 'appearance', fields: [
    select('theme', themeChoices),
    color('gradientFrom'),
    color('gradientTo'),
    range('gradientAngle', 0, 360),
    range('blur', 0, 30),
    check('textAuto'),
    color('textColor')
  ] },
  { id: 'darkUi', fields: [
    select('darkElements', [['auto', 'choice.darkAuto'], ['on', 'choice.darkOn'], ['off', 'choice.darkOff']])
  ] },
  { id: 'tab', fields: [
    text('tabTitle', 'newTab'),
    select('tabIcon', [['emoji', 'choice.tabEmoji'], ['bg', 'choice.tabBg'], ['none', 'choice.tabNone']]),
    text('tabEmoji', '❤️')
  ] },
  { id: 'clock', fields: [
    check('showClock'),
    range('clockSize', 40, 180),
    range('clockWeight', 100, 700, 100),
    range('clockTop', 0, 260),
    check('showSeconds'),
    check('hour12'),
    check('showDate'),
    check('showWeather'),
    text('city', 'ph.city')
  ] },
  { id: 'search', fields: [
    check('showSearch'),
    select('searchEngine', [['browser', 'choice.engineBrowser'], ['google', 'Google'], ['ddg', 'DuckDuckGo'], ['bing', 'Bing']]),
    check('showPills')
  ] },
  { id: 'tiles', fields: [
    range('columns', 3, 10),
    range('tileHeight', 56, 140),
    range('tileRadius', 0, 32),
    range('tileGap', 0, 24),
    range('contentWidth', 480, 1200, 20),
    check('showLabels'),
    check('showFolderIcons'),
    check('openInNewTab')
  ] },
  { id: 'drag', fields: [
    range('snapStep', 0, 60, 5)
  ] },
  { id: 'bookmarks', fields: [
    check('unblurOnHover'),
    select('bookmarkSource', [['all', 'choice.bmAll'], ['toolbar', 'choice.bmToolbar']]),
    check('mirrorBookmarks')
  ] }
];

/** Дополнительные действия после изменения отдельных настроек. */
const AFTER_CHANGE = {
  bookmarkSource: () => importNow(),
  mirrorBookmarks: () => { if (S.opts.mirrorBookmarks) rebuildMirror(); },
  language: () => { emit('language'); reopenSettings(); },
  city: () => emit('weather:refresh'),
  showWeather: () => emit('weather:refresh')
};

const GITHUB_PATH =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z';

function githubIcon() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const shape = document.createElementNS(ns, 'path');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('aria-hidden', 'true');
  shape.setAttribute('fill', 'currentColor');
  shape.setAttribute('d', GITHUB_PATH);
  svg.append(shape);
  return svg;
}

/* ---- Панель ---- */

const panel = () => $('#settings');

export function closeSettings() {
  panel().classList.remove('open');
}

function buildControl(field) {
  switch (field.type) {
    case 'select':
      return h('select', { value: S.opts[field.key] }, field.choices.map(([value, label]) => h('option', { value }, t(label))));
    case 'range':
      return h('input', { type: 'range', min: field.min, max: field.max, step: field.step });
    case 'check':
      return h('input', { type: 'checkbox' });
    case 'color':
      return h('input', { type: 'color' });
    default:
      return h('input', { type: 'text', placeholder: t(field.placeholder) });
  }
}

function buildRow(field) {
  const control = buildControl(field);
  control.dataset.key = field.key;
  const row = h('label', { class: 'settings-row', dataset: { key: field.key } },
    h('span', {}, t('opt.' + field.key)),
    control,
    field.type === 'range' ? h('output') : null,
    h('button', { type: 'button', class: 'reset-option', title: t('settings.resetOne') }, '↺')
  );
  writeControl(control, S.opts[field.key]);
  return row;
}

/** Для ползунков показывает текущее число рядом с ним. */
function showValue(control) {
  const output = control.closest('.settings-row').querySelector('output');
  if (output) output.textContent = control.value;
}

function writeControl(control, value) {
  if (control.type === 'checkbox') control.checked = Boolean(value);
  else control.value = value;
  showValue(control);
}

function readControl(control) {
  if (control.type === 'checkbox') return control.checked;
  if (control.type === 'range') return Number(control.value);
  return control.value;
}

export function openSettings() {
  const defaults = defaultOptions();
  const el = panel();

  const body = h('div', { class: 'settings-body' });
  el.replaceChildren(
    h('div', { class: 'settings-header' },
      h('b', {}, t('settings.title')),
      h('button', { type: 'button', id: 'settings-close', title: t('settings.close') }, '✕')
    ),
    body,
    h('div', { class: 'settings-footer' },
      h('div', { class: 'actions' },
        h('button', { type: 'button', id: 'settings-data' }, t('settings.export')),
        h('button', { type: 'button', id: 'settings-reset' }, t('settings.resetAll'))
      ),
      h('div', { class: 'credit' },
        h('span', {}, t('settings.credit')),
        h('a', { href: 'https://github.com/Btwkek', target: '_blank', rel: 'noopener noreferrer', title: 'GitHub', 'aria-label': 'GitHub' }, githubIcon())
      )
    )
  );

  for (const section of SECTIONS) {
    const title = document.createElement('h4');
    title.textContent = t('sec.' + section.id);
    body.append(title, ...section.fields.map(buildRow));
  }

  // Стрелка сброса видна только у изменённых настроек.
  const markChanged = () => {
    body.querySelectorAll('.settings-row').forEach(row => {
      const key = row.dataset.key;
      row.querySelector('.reset-option').classList.toggle('visible', !sameJson(S.opts[key], defaults[key]));
    });
  };
  markChanged();

  body.oninput = event => {
    const key = event.target.dataset.key;
    if (!key) return;
    S.opts[key] = readControl(event.target);
    showValue(event.target);
    if (key === 'textColor') S.opts.textAuto = false;
    save();
    if (key !== 'city') emit('render');
    markChanged();
  };
  body.onchange = event => AFTER_CHANGE[event.target.dataset.key]?.();
  body.onclick = event => {
    const reset = event.target.closest('.reset-option');
    if (!reset) return;
    event.preventDefault();
    const row = reset.parentElement;
    const key = row.dataset.key;
    S.opts[key] = defaults[key];
    writeControl(row.querySelector('select, input'), defaults[key]);
    save();
    emit('render');
    markChanged();
    AFTER_CHANGE[key]?.();
  };

  $('#settings-close').onclick = closeSettings;
  $('#settings-data').onclick = () => { closeSettings(); openDataDialog(); };
  $('#settings-reset').onclick = () => {
    if (!confirm(t('settings.resetConfirm'))) return;
    S.opts = { ...defaultOptions(), city: S.opts.city, language: S.opts.language };
    save();
    emit('render');
    emit('weather:refresh');
    openSettings();
  };

  el.classList.add('open');
}

/** Перестраивает открытую панель (например, после смены языка), не сбрасывая прокрутку. */
function reopenSettings() {
  const top = $('.settings-body')?.scrollTop ?? 0;
  openSettings();
  $('.settings-body').scrollTop = top;
}

export function initSettings() {
  on('settings:open', openSettings);
  document.addEventListener('pointerdown', event => {
    if (panel().classList.contains('open') && !event.target.closest('#settings, #context-menu, #menu-button')) closeSettings();
  });
}
