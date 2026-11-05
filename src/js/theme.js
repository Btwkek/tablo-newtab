/** Тема оформления: фон, цвета, размеры и тёмные элементы. */

import { THEMES } from './config.js';
import { emit } from './events.js';
import { S } from './state.js';
import { $, hexToRgb, luminance } from './util.js';

let randomThemeId = null;

/** Идентификатор темы с учётом режимов «Авто» и «Случайная». */
export function currentThemeId() {
  const theme = S.opts.theme;
  if (theme === 'auto') {
    const hour = new Date().getHours();
    return hour >= 7 && hour < 19 ? 'light' : 'dark';
  }
  if (theme === 'random') {
    const ids = Object.keys(THEMES);
    return (randomThemeId ??= ids[Math.floor(Math.random() * ids.length)]);
  }
  return theme;
}

/* ---- Яркость картинки-фона (определяется один раз и запоминается) ---- */

const imageBrightness = { src: null, dark: false };

function measureImage(src) {
  imageBrightness.src = src;
  imageBrightness.dark = false;
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 16;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, 16, 16);
    const { data } = context.getImageData(0, 0, 16, 16);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += luminance([data[i], data[i + 1], data[i + 2]]);
    if (imageBrightness.src !== src) return;
    imageBrightness.dark = sum / (data.length / 4) < 0.5;
    emit('render');
  };
  image.src = src;
}

function imageIsDark(src) {
  if (imageBrightness.src !== src) measureImage(src);
  return imageBrightness.dark;
}

/**
 * Описание текущего фона: css-значение, тёмный ли он и какого цвета текст на нём.
 */
export function backdrop() {
  const o = S.opts;

  if (S.bg) {
    const dark = imageIsDark(S.bg);
    return { css: `url("${S.bg}")`, dark, text: dark ? '#fff' : '#2b2438' };
  }

  const id = currentThemeId();
  if (id === 'custom' || !THEMES[id]) {
    const average = (luminance(hexToRgb(o.gradientFrom)) + luminance(hexToRgb(o.gradientTo))) / 2;
    const dark = average < 0.5;
    return {
      css: `linear-gradient(${o.gradientAngle}deg,${o.gradientFrom},${o.gradientTo})`,
      dark,
      text: dark ? '#fff' : '#2b2438'
    };
  }

  const theme = THEMES[id];
  return { css: theme.css, dark: theme.dark, text: theme.text };
}

/** Тёмные элементы включены (по теме или вручную). */
export const isDarkUi = () => document.body.classList.contains('ui-dark');

export function applyAppearance() {
  const o = S.opts;
  const back = backdrop();
  const dark = o.darkElements === 'on' || (o.darkElements === 'auto' && back.dark);

  const vars = {
    '--columns': o.columns,
    '--tile-height': o.tileHeight + 'px',
    '--tile-radius': o.tileRadius + 'px',
    '--tile-gap': o.tileGap + 'px',
    '--content-width': o.contentWidth + 'px',
    '--fg': o.textAuto ? back.text : o.textColor,
    '--clock-size': o.clockSize + 'px',
    '--clock-weight': o.clockWeight,
    '--clock-top': o.clockTop + 'px',
    '--snap': (o.snapStep || 0) + 'px'
  };
  for (const [name, value] of Object.entries(vars)) document.documentElement.style.setProperty(name, value);

  const background = $('#background');
  background.style.backgroundImage = back.css;
  background.style.filter = o.blur ? `blur(${o.blur}px)` : '';

  const body = document.body.classList;
  body.toggle('ui-dark', dark);
  body.toggle('no-labels', !o.showLabels);
  body.toggle('unblur-on-hover', o.unblurOnHover);
  body.toggle('no-snap', !(o.snapStep > 0));
}
