/**
 * Пипетка для выбора цвета плитки.
 * Если браузер умеет EyeDropper, берём системную пипетку (цвет можно взять с любого места экрана).
 * Иначе включается выбор прямо на странице: клик по значку даёт цвет пикселя значка,
 * клик по плитке, ссылке или фону даёт их цвет. Esc отменяет выбор.
 */

import { t } from './i18n.js';

const hex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

/** Все rgb()/rgba() в строке CSS; прозрачные пропускаются. */
function rgbValues(text) {
  const colors = [];
  for (const match of text.matchAll(/rgba?\(([^)]+)\)/g)) {
    const [r, g, b, a = 1] = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (a > 0.1) colors.push([r, g, b]);
  }
  return colors;
}

/** Цвет пикселя значка под точкой (x, y) или null, если пиксель прозрачный. */
async function sampleImage(img, x, y) {
  let url = '';
  try {
    const response = await fetch(img.currentSrc || img.src);
    url = URL.createObjectURL(await response.blob());
    const copy = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });
    const rect = img.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(rect.width));
    canvas.height = Math.max(1, Math.round(rect.height));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(copy, 0, 0, canvas.width, canvas.height);
    const px = Math.min(canvas.width - 1, Math.max(0, Math.floor(x - rect.left)));
    const py = Math.min(canvas.height - 1, Math.max(0, Math.floor(y - rect.top)));
    const [r, g, b, a] = context.getImageData(px, py, 1, 1).data;
    return a < 20 ? null : [r, g, b];
  } catch {
    return null;
  } finally {
    if (url) URL.revokeObjectURL(url);
  }
}

/** Цвет того, что лежит под точкой: пиксель значка, цвет фона или середина градиента. */
async function colorAt(x, y, overlay) {
  for (const element of document.elementsFromPoint(x, y)) {
    if (element === overlay) continue;
    if (element instanceof HTMLImageElement) {
      const color = await sampleImage(element, x, y);
      if (color) return hex(color);
      continue;
    }
    const style = getComputedStyle(element);
    const solid = rgbValues(style.backgroundColor);
    if (solid.length) return hex(solid[0]);
    const stops = rgbValues(style.backgroundImage);
    if (stops.length) return hex([0, 1, 2].map(c => stops.reduce((sum, color) => sum + color[c], 0) / stops.length));
  }
  return null;
}

function pickFromPage() {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483000;cursor:crosshair;';
    const hint = document.createElement('div');
    hint.textContent = t('picker.hint');
    hint.style.cssText =
      'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);padding:8px 14px;border-radius:10px;' +
      'background:rgba(20,18,28,.92);color:#fff;font:13px system-ui,sans-serif;pointer-events:none;';
    overlay.append(hint);

    const finish = value => {
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
      resolve(value);
    };
    const onKey = event => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      finish(null);
    };
    overlay.onclick = async event => finish(await colorAt(event.clientX, event.clientY, overlay));
    document.addEventListener('keydown', onKey, true);
    document.body.append(overlay);
  });
}

/** Возвращает выбранный цвет «#rrggbb» или null, если выбор отменён. */
export async function pickColor() {
  if ('EyeDropper' in window) {
    try {
      return (await new window.EyeDropper().open()).sRGBHex;
    } catch {
      return null; // отмена
    }
  }
  return pickFromPage();
}
