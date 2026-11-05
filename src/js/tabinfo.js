/** Название и значок вкладки браузера. */

import { S } from './state.js';
import { t } from './i18n.js';
import { backdrop, currentThemeId } from './theme.js';
import { $, escapeHtml, svgDataUri } from './util.js';

let appliedKey = '';

const svgIcon = body => svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`);

function setIcon(href) {
  $('#favicon').setAttribute('href', href);
}

/** Значок из текущей картинки-фона. */
function iconFromImage(src) {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const context = canvas.getContext('2d');
    context.beginPath();
    (context.roundRect || context.rect).call(context, 0, 0, 64, 64, 16);
    context.clip();
    const scale = Math.max(64 / image.width, 64 / image.height);
    context.drawImage(image, (64 - image.width * scale) / 2, (64 - image.height * scale) / 2, image.width * scale, image.height * scale);
    setIcon(canvas.toDataURL('image/png'));
  };
  image.src = src;
}

/** Значок-часы в цветах текущего градиента. */
function iconFromGradient() {
  const colors = backdrop().css.match(/#[0-9a-f]{6}/gi) ?? [S.opts.gradientFrom, S.opts.gradientTo];
  const top = colors[0];
  const bottom = colors[colors.length - 1];
  setIcon(svgIcon(
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>` +
    '<rect width="100" height="100" rx="24" fill="url(#g)"/>' +
    '<circle cx="50" cy="50" r="22" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="7"/>' +
    '<path d="M50 38v12l8 6" stroke="#fff" stroke-opacity=".9" stroke-width="6" fill="none" stroke-linecap="round"/>'
  ));
}

export function applyTabInfo() {
  const o = S.opts;
  document.title = o.tabTitle || t('newTab');

  const key = [o.tabIcon, o.tabEmoji, S.bg ? S.bg.length : currentThemeId() + o.gradientFrom + o.gradientTo].join('|');
  if (key === appliedKey) return;
  appliedKey = key;

  if (o.tabIcon === 'none') return setIcon(svgIcon(''));
  if (o.tabIcon === 'emoji') {
    return setIcon(svgIcon(`<text x="50" y="80" font-size="80" text-anchor="middle">${escapeHtml(o.tabEmoji || '❤️')}</text>`));
  }
  if (S.bg) return iconFromImage(S.bg);
  iconFromGradient();
}
