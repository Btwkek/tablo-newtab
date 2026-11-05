/** Точка входа: загрузка данных, отрисовка и подключение модулей. */

import { S, loadState, onExternalChange, save, setState } from './state.js';
import { on } from './events.js';
import { applyAppearance } from './theme.js';
import { renderGrid, renderFolder, closeFolder } from './grid.js';
import { renderPills } from './pills.js';
import { startClock, updateClock, updateWeather } from './clock.js';
import { initSearch } from './search.js';
import { applyTabInfo } from './tabinfo.js';
import { applyLayout, initLayout, setEditMode } from './layout.js';
import { clearWidgets, openAddWidget, syncWidgets } from './widgets.js';
import { closeSettings, initSettings, openSettings } from './settings.js';
import { initBookmarks, requestBookmarkAccess } from './bookmarks.js';
import { initDataIo, openDataDialog } from './dataio.js';
import { hideMenu, showMenu } from './ui.js';
import { setLanguage, t, translateDom } from './i18n.js';
import { $ } from './util.js';

/** Показывает и скрывает блоки согласно настройкам. */
function applyVisibility() {
  const o = S.opts;
  $('#time').style.display = o.showClock ? '' : 'none';
  $('#dateline').style.display = o.showClock && (o.showDate || o.showWeather) ? '' : 'none';
  $('#date').style.display = o.showDate ? '' : 'none';
  $('#search').style.display = o.showSearch ? '' : 'none';
  $('#pills').style.display = o.showPills ? '' : 'none';
}

function render() {
  setLanguage(S.opts.language);
  translateDom();
  applyAppearance(); // первым: от него зависят цвета плиток
  applyVisibility();
  renderGrid();
  renderPills();
  renderFolder();
  updateClock();
  syncWidgets();
  applyLayout();
  applyTabInfo();
}

/* ---- Меню «⋯» ---- */

function openMainMenu(event) {
  event.stopPropagation();
  const rect = event.currentTarget.getBoundingClientRect();
  showMenu(rect.left - 190, rect.bottom + 6, [
    [t('menu.edit'), () => setEditMode(true)],
    [t('menu.addWidget'), openAddWidget],
    [t('menu.changeBg'), () => $('#background-file').click()],
    [t('menu.resetBg'), () => { S.bg = null; save(); render(); }],
    [t('menu.importBookmarks'), requestBookmarkAccess],
    [t('menu.data'), openDataDialog],
    [t('menu.settings'), openSettings]
  ]);
}

function chooseBackground(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { S.bg = reader.result; save(); render(); };
  reader.readAsDataURL(file);
  event.target.value = '';
}

/* ---- Запуск ---- */

async function start() {
  const existed = await loadState();
  if (!existed) await save();

  on('render', render);
  on('weather:refresh', () => updateWeather(true));
  on('language', () => updateWeather());

  $('#menu-button').onclick = openMainMenu;
  $('#background-file').onchange = chooseBackground;
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeFolder(); hideMenu(); closeSettings(); }
  });

  initSettings();
  initLayout();
  initSearch();
  initDataIo();

  // Изменения из другой вкладки подхватываются, если эта вкладка не в фокусе.
  onExternalChange(value => {
    if (document.hasFocus()) return;
    setState(value);
    clearWidgets();
    render();
  });

  render();
  startClock();
  updateWeather();
  await initBookmarks();
}

start();
