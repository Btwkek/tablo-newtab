/**
 * Цвет плитки по значку сайта (настройка «Цветные плитки»).
 *
 * Чтобы прочитать значок, нужен необязательный доступ к сервису значков Google:
 * его просят при включении настройки. С доступом берётся самый заметный цвет значка.
 * Без доступа берётся цвет известного сервиса из BRANDS, а для остальных сайтов —
 * устойчивый цвет по названию домена (приблизительный).
 * Точные цвета запоминаются, поэтому при следующих открытиях вкладки плитки красятся сразу.
 */

import { hostOf } from './util.js';

const STORAGE_KEY = 'tablo.tileColors.v4';
const NEUTRAL = { bg: 'linear-gradient(180deg, #34313f, #221f2b)', light: true };

/** Цвета популярных сервисов: используются, когда значок не удаётся прочитать. */
const BRANDS = {
  'youtube.com': '#ff0000', 'google.com': null, 'steampowered.com': '#1b4a72', 'discord.com': '#5865f2',
  'twitch.tv': '#9146ff', 'vk.com': '#0077ff', 'vk.ru': '#0077ff', 'telegram.org': '#229ed9',
  'reddit.com': '#ff4500', 'x.com': '#000000', 'twitter.com': '#000000', 'amazon.com': '#232f3e',
  'wikipedia.org': '#ffffff', 'spotify.com': '#1db954', 'netflix.com': '#141414', 'yandex.ru': '#fc3f1d',
  'ya.ru': '#fc3f1d', 'mail.ru': '#005ff9', 'github.com': '#24292e', 'facebook.com': '#1877f2',
  'instagram.com': '#c13584', 'linkedin.com': '#0a66c2', 'whatsapp.com': '#25d366', 'tiktok.com': '#111111',
  'pinterest.com': '#e60023', 'ebay.com': '#e53238', 'ozon.ru': '#005bff', 'wildberries.ru': '#cb11ab',
  'kinopoisk.ru': '#ff5500', 'ok.ru': '#ee8208', 'translate.google.com': '#4285f4', 'mail.google.com': '#ea4335'
};

/* ---- Цвет ---- */

const parseHex = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

/** Яркость цвета от 0 (чёрный) до 1 (белый) по формуле WCAG. */
function luminance([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

const mix = (color, target, amount) => color.map((v, i) => Math.round(v + (target[i] - v) * amount));
const css = ([r, g, b]) => `rgb(${r} ${g} ${b})`;

/** Белая подпись для всех плиток, кроме светлых (белых, жёлтых, оранжевых). */
const wantsLightText = color => luminance(color) < 0.4;

const BASE = [29, 27, 37]; // тёмная основа плитки, с которой смешивается цвет значка

/** Насыщает цвет, чтобы после смешивания с тёмным он не стал грязным. */
function vivid(rgb) {
  const [h, s, l] = rgbToHsl(...rgb);
  const sat = Math.max(s, 0.75), light = Math.min(Math.max(l, 0.38), 0.52);
  const f = n => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (light - sat * Math.min(light, 1 - light) * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return [f(0), f(8), f(4)];
}

/**
 * Превращает запись { kind, rgb } в оформление плитки { bg, light }.
 *  - bg: у значка есть свой фон, плитка точно такого цвета (значок не выделяется рамкой);
 *  - accent: цвет значка смешивается с тёмной основой в меру strength (20–100), gradient — с градиентом или плоский;
 *  - neutral: значок серый или разноцветный.
 */
export function tileStyle(entry, strength = 90, gradient = true) {
  if (entry.kind === 'bg') return { bg: css(entry.rgb), light: wantsLightText(entry.rgb) };
  if (entry.kind === 'neutral') return gradient ? NEUTRAL : { bg: '#2a2733', light: true };
  let color = mix(BASE, vivid(entry.rgb), Math.min(Math.max(strength, 20), 100) / 100);
  for (let i = 0; i < 12 && luminance(color) > 0.3; i++) color = mix(color, [0, 0, 0], 0.08);
  return {
    bg: gradient
      ? `linear-gradient(180deg, ${css(mix(color, [255, 255, 255], 0.07))}, ${css(mix(color, [0, 0, 0], 0.2))})`
      : css(color),
    light: true
  };
}

/** Самый заметный цвет значка в виде [r, g, b] или null, если значок серый или разноцветный. */
export function dominantColor(data) {
  const BINS = 24;
  const weight = new Float64Array(BINS), count = new Uint32Array(BINS);
  const sums = Array.from({ length: BINS }, () => [0, 0, 0]);
  let opaque = 0, colored = 0, total = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    opaque++;
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (s < 0.35 || l < 0.12 || l > 0.92) continue;
    const bin = Math.floor((h / 360) * BINS) % BINS;
    weight[bin] += s; count[bin]++;
    sums[bin][0] += data[i] * s; sums[bin][1] += data[i + 1] * s; sums[bin][2] += data[i + 2] * s; // яркие пиксели важнее
    colored++; total += s;
  }
  if (!opaque || colored < opaque * 0.15) return null;

  let best = -1, bestScore = 0;
  for (let b = 0; b < BINS; b++) {
    if (!count[b]) continue; // середина окна должна содержать пиксели
    const score = weight[b] + weight[(b + 1) % BINS] + weight[(b + BINS - 1) % BINS];
    if (score > bestScore) { bestScore = score; best = b; }
  }
  if (best < 0 || bestScore / total < 0.55) return null; // несколько равных цветов, как у Google
  return sums[best].map(v => Math.round(v / weight[best]));
}

/** Цвет собственного фона значка (по его краю) или null, если фон прозрачный или неоднородный. */
export function backgroundColor(data, size = 32) {
  const ring = [];
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      if (x !== 1 && y !== 1 && x !== size - 2 && y !== size - 2) continue;
      const i = (y * size + x) * 4;
      ring.push([data[i], data[i + 1], data[i + 2], data[i + 3]]);
    }
  }
  const solid = ring.filter(pixel => pixel[3] >= 200);
  if (solid.length < ring.length * 0.85) return null;
  const avg = [0, 1, 2].map(c => Math.round(solid.reduce((sum, pixel) => sum + pixel[c], 0) / solid.length));
  const close = solid.filter(pixel => Math.hypot(pixel[0] - avg[0], pixel[1] - avg[1], pixel[2] - avg[2]) < 40);
  return close.length >= solid.length * 0.85 ? avg : null;
}

function hashRgb(text) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const [h, s, l] = [hash % 360, 0.45, 0.4];
  const f = n => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return [f(0), f(8), f(4)];
}

function brandEntry(host) {
  for (const [domain, hex] of Object.entries(BRANDS)) {
    if (host === domain || host.endsWith('.' + domain)) {
      if (!hex) return { kind: 'neutral' };
      const rgb = parseHex(hex);
      return { kind: luminance(rgb) < 0.02 || luminance(rgb) > 0.8 ? 'bg' : 'accent', rgb };
    }
  }
  return null;
}

/* ---- Чтение значка ---- */

/** Адреса, к которым нужен необязательный доступ, чтобы читать цвет значков. */
export const ICON_ORIGINS = ['https://www.google.com/s2/favicons*', 'https://*.gstatic.com/faviconV2*'];

/** Выдан ли доступ к значкам (обновляется через refreshIconAccess и requestIconAccess). */
export let iconAccessGranted = false;

export async function refreshIconAccess() {
  try {
    iconAccessGranted = await browser.permissions.contains({ origins: ICON_ORIGINS });
  } catch {
    iconAccessGranted = false;
  }
  return iconAccessGranted;
}

/** Просит доступ к значкам (вызывать из обработчика действия пользователя). */
export async function requestIconAccess() {
  try {
    iconAccessGranted = await browser.permissions.request({ origins: ICON_ORIGINS });
  } catch {
    iconAccessGranted = false;
  }
  return iconAccessGranted;
}

/** Загружает значок средствами расширения (без доступа это не получится) и читает его пиксели. */
async function readPixels(src) {
  let url = '';
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    url = URL.createObjectURL(await response.blob());
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 32;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, 32, 32);
    return context.getImageData(0, 0, 32, 32).data;
  } catch {
    return null; // нет доступа к значку или это не картинка
  } finally {
    if (url) URL.revokeObjectURL(url);
  }
}

/* ---- Кэш и публичные функции ---- */

/** Точные цвета (по пикселям) хранятся между запусками, приблизительные — только пока открыта вкладка. */
const exact = new Map();
const estimated = new Map();
try {
  for (const [key, style] of Object.entries(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'))) exact.set(key, style);
} catch { /* кэш необязателен */ }

function remember(key, style) {
  exact.set(key, style);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries([...exact].slice(-300))));
  } catch { /* не страшно: цвет посчитается заново */ }
}

/** Забывает приблизительные цвета (например, после выдачи доступа к значкам). */
export const forgetEstimates = () => estimated.clear();

const hostName = site => hostOf(site.url).replace(/^www\./, '');
const keyOf = site => (site.icon ? `i:${site.id}:${site.icon.length}` : `h:${hostName(site)}:${site.title || ''}`);

/** Готовый цвет из кэша или undefined. */
export const cachedTileColor = site => exact.get(keyOf(site)) ?? estimated.get(keyOf(site));

/** Запись о цвете сайта { kind, rgb } (см. tileStyle); считается один раз. */
export async function tileColor(site) {
  const key = keyOf(site);
  const ready = cachedTileColor(site);
  if (ready) return ready;

  const host = hostName(site);
  const src = site.icon || (host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : '');
  const pixels = src ? await readPixels(src) : null;

  if (pixels) {
    const own = backgroundColor(pixels);
    const accent = own ? null : dominantColor(pixels);
    const entry = own ? { kind: 'bg', rgb: own } : accent ? { kind: 'accent', rgb: accent } : { kind: 'neutral' };
    remember(key, entry);
    return entry;
  }
  const guess = brandEntry(host) ?? { kind: 'accent', rgb: hashRgb(host || site.title || '?') };
  estimated.set(key, guess);
  return guess;
}
