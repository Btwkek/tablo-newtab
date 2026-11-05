/** Значения по умолчанию, темы и перенос настроек из старых версий. */

import { uid } from './util.js';
import { t } from './i18n.js';

export const STATE_KEY = 'state2';
export const STATE_VERSION = 5;

export const WIDGET_TYPES = ['note', 'todo', 'count', 'timer'];

export const SEARCH_ENGINES = {
  google: 'https://www.google.com/search?q=',
  ddg: 'https://duckduckgo.com/?q=',
  bing: 'https://www.bing.com/search?q='
};

export const defaultOptions = () => ({
  v: STATE_VERSION,

  // Язык интерфейса: auto (как в браузере) | ru | en
  language: 'auto',

  // Оформление
  theme: 'dark',
  darkElements: 'auto', // auto | on | off
  gradientFrom: '#e9d5ff',
  gradientTo: '#ffc9ce',
  gradientAngle: 180,
  blur: 0,
  textAuto: true,
  textColor: '#4b3a57',

  // Вкладка браузера
  tabTitle: '',
  tabIcon: 'emoji', // emoji | bg | none
  tabEmoji: '❤️',

  // Часы
  showClock: true,
  clockSize: 104,
  clockWeight: 200,
  clockTop: 70,
  showSeconds: false,
  hour12: false,
  showDate: true,
  showWeather: true,
  city: '',

  // Поиск и быстрые ссылки
  showSearch: true,
  searchEngine: 'browser',
  showPills: true,

  // Плитки
  columns: 6,
  tileHeight: 84,
  tileRadius: 8,
  tileGap: 8,
  colorTiles: true,
  colorTilesStrength: 100,
  colorTilesGradient: false,
  contentWidth: 760,
  showLabels: true,
  showFolderIcons: true,
  openInNewTab: false,

  // Перетаскивание
  snapStep: 20,

  // Закладки
  bookmarkSource: 'all', // all | toolbar
  unblurOnHover: true,
  mirrorBookmarks: true,
  bookmarkPromptDismissed: false
});

export const defaultPills = () => [
  { id: uid(), type: 'site', title: 'YouTube', url: 'https://www.youtube.com' },
  { id: uid(), type: 'site', title: t('pill.translate'), url: 'https://translate.google.com' },
  { id: uid(), type: 'site', title: 'Gmail', url: 'https://mail.google.com' }
];

/**
 * Темы. dark — тёмная ли тема: от этого зависит, включатся ли тёмные
 * элементы (поиск, быстрые ссылки, плитки, панель настроек).
 */
export const THEMES = {
  light: {
    dark: false, text: '#4b3a57',
    css: 'radial-gradient(90% 38% at 50% 108%,rgba(255,255,255,.4),rgba(255,255,255,0) 70%),radial-gradient(70% 45% at 50% 12%,#f3d3ff,rgba(243,211,255,0) 75%),linear-gradient(180deg,#edd9ff 0%,#f6cdf2 38%,#fbc8dd 70%,#ffc9ce 100%)'
  },
  vivid: {
    dark: false, text: '#fff',
    css: 'radial-gradient(60% 45% at 8% 78%,#ffd76a,rgba(255,215,106,0) 70%),radial-gradient(70% 55% at 45% 100%,#ff7a2f,rgba(255,122,47,0) 70%),radial-gradient(50% 40% at 100% 45%,#ff4fa8,rgba(255,79,168,0) 70%),linear-gradient(180deg,#7a2bb0 0%,#c93fb0 18%,#ff62a8 40%,#ff8a5c 75%,#ffb15c 100%)'
  },
  blue: { dark: false, text: '#2b3a67', css: 'linear-gradient(180deg,#dbeafe 0%,#c7d2fe 50%,#fbcfe8 100%)' },
  mint: { dark: false, text: '#14532d', css: 'linear-gradient(180deg,#d1fae5 0%,#a7f3d0 45%,#bae6fd 100%)' },
  sunset: { dark: true, text: '#fff', css: 'linear-gradient(180deg,#3b1d5a 0%,#c2417a 45%,#ff9966 100%)' },
  ocean: { dark: true, text: '#e0f2fe', css: 'linear-gradient(180deg,#0b2447 0%,#19376d 50%,#576cbc 100%)' },
  forest: { dark: true, text: '#ecfccb', css: 'linear-gradient(180deg,#0f2a1d 0%,#1f4d36 55%,#3f7d58 100%)' },
  graphite: { dark: true, text: '#e5e7eb', css: 'linear-gradient(180deg,#16181d 0%,#23262e 100%)' },
  dark: { dark: true, text: '#f3e8ff', css: 'linear-gradient(180deg,#1f1b2e 0%,#2d2440 60%,#412a4f 100%)' }
};

/* ---- Перенос данных из старых версий ---- */

const RENAMED_OPTIONS = {
  c1: 'gradientFrom', c2: 'gradientTo', angle: 'gradientAngle',
  fgAuto: 'textAuto', fg: 'textColor',
  clockOn: 'showClock', top: 'clockTop', seconds: 'showSeconds', h12: 'hour12', weather: 'showWeather',
  searchOn: 'showSearch', engine: 'searchEngine', pillsOn: 'showPills',
  cols: 'columns', th: 'tileHeight', rad: 'tileRadius', gap: 'tileGap', gw: 'contentWidth',
  labels: 'showLabels', folderIcons: 'showFolderIcons', newTab: 'openInNewTab',
  snap: 'snapStep',
  bmSrc: 'bookmarkSource', fbHover: 'unblurOnHover', mirror: 'mirrorBookmarks', bmNo: 'bookmarkPromptDismissed'
};

/** Опции, которых больше нет (включая их старые названия). */
const REMOVED_OPTIONS = [
  'sdark', 'pdark', 'tdark', // тёмные элементы теперь включаются по теме
  'greet', 'greeting', 'greetName', // приветствие
  'tileFill', 'tileColor', 'tileStr', 'tileFillStrength' // заливка плиток
];

/** Приводит настройки из любой версии к текущим названиям. */
export function migrateOptions(old = {}) {
  const result = {};
  for (const [key, value] of Object.entries(old)) {
    if (REMOVED_OPTIONS.includes(key)) continue;
    result[RENAMED_OPTIONS[key] ?? key] = value;
  }
  return result;
}
