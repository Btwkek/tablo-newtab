/** Простая шина событий, чтобы модули не импортировали друг друга по кругу. */

const bus = new EventTarget();

export const on = (name, handler) => bus.addEventListener(name, handler);
export const emit = (name, detail) => bus.dispatchEvent(new CustomEvent(name, { detail }));

/*
 * События:
 *   render         — нужно перерисовать страницу
 *   saved          — состояние записано в хранилище
 *   settings:open  — открыть панель настроек
 */
