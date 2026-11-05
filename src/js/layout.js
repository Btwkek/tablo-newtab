/** Режим правки: блоки страницы перетаскиваются так, чтобы их края ложились на сетку. */

import { S, save } from './state.js';
import { toast } from './ui.js';
import { t } from './i18n.js';
import { $, $$ } from './util.js';

/** Округляет координату до шага сетки (если привязка включена). */
export function snapValue(value) {
  const step = S.opts.snapStep;
  return step > 0 ? Math.round(value / step) * step : Math.round(value);
}

export function applyLayout() {
  for (const block of $$('.block')) {
    const offset = S.layout[block.dataset.block];
    block.style.translate = offset ? `${offset[0]}px ${offset[1]}px` : '';
  }
}

export function setEditMode(on) {
  document.body.classList.toggle('editing', on);
  $('#edit-bar').hidden = !on;
  if (on) toast(t('layout.hint'));
}

/**
 * Смещение считается так, чтобы левый и верхний край самого блока (а не его
 * обёртки) оказались на линии сетки: берём положение блока без смещения
 * и подбираем такое смещение, при котором итоговая координата кратна шагу.
 */
function startBlockDrag(event, handle) {
  event.preventDefault();
  const block = handle.parentElement;
  const key = block.dataset.block;
  const start = S.layout[key] ?? [0, 0];

  const content = block.querySelector(':scope > :not(.drag-handle)');
  const rect = content.getBoundingClientRect();
  const home = { x: rect.left + scrollX - start[0], y: rect.top + scrollY - start[1] };
  const pointer = { x: event.clientX, y: event.clientY };

  handle.setPointerCapture(event.pointerId);
  document.body.classList.add('dragging-block');

  handle.onpointermove = move => {
    S.layout[key] = [
      snapValue(home.x + start[0] + move.clientX - pointer.x) - home.x,
      snapValue(home.y + start[1] + move.clientY - pointer.y) - home.y
    ];
    applyLayout();
  };
  handle.onpointerup = () => {
    handle.onpointermove = handle.onpointerup = null;
    document.body.classList.remove('dragging-block');
    save();
  };
}

export function initLayout() {
  $('#edit-done').onclick = () => setEditMode(false);
  $('#edit-reset').onclick = () => {
    S.layout = {};
    applyLayout();
    save();
  };
  document.addEventListener('pointerdown', event => {
    const handle = event.target.closest('.drag-handle');
    if (handle) startBlockDrag(event, handle);
  });
}
