/** Общие элементы интерфейса: уведомление, контекстное меню, модальное окно. */

import { $ } from './util.js';

/* ---- Уведомление ---- */

let toastTimer;

export function toast(message, duration = 4000) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, duration);
}

/* ---- Контекстное меню ---- */

/** items — массив пар [подпись, действие]. */
export function showMenu(x, y, items) {
  const menu = $('#context-menu');
  menu.replaceChildren();
  for (const [label, action] of items) {
    const row = document.createElement('div');
    row.textContent = label;
    row.onclick = () => { hideMenu(); action(); };
    menu.append(row);
  }
  menu.hidden = false;
  menu.style.left = Math.max(0, Math.min(x, innerWidth - 190)) + 'px';
  menu.style.top = Math.max(0, Math.min(y, innerHeight - items.length * 36 - 10)) + 'px';
}

export const hideMenu = () => { $('#context-menu').hidden = true; };

document.addEventListener('click', event => {
  if (!event.target.closest('#context-menu, #menu-button')) hideMenu();
});

/* ---- Модальное окно ---- */

/** Показывает окно с переданными элементами и возвращает <dialog>. */
export function openModal(...nodes) {
  const dialog = $('#modal');
  dialog.replaceChildren(...nodes);
  dialog.onclick = null;
  if (!dialog.open) dialog.showModal();
  return dialog;
}
