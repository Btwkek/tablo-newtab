/** Виджеты на странице: заметка, задачи, отсчёт до даты, таймер. */

import { S, save } from './state.js';
import { snapValue } from './layout.js';
import { openModal, toast } from './ui.js';
import { t } from './i18n.js';
import { $, h, uid } from './util.js';

const KINDS = {
  note: { icon: '📝', width: 240, height: 180 },
  todo: { icon: '☑️', width: 240, height: 0 },
  count: { icon: '⏳', width: 230, height: 0 },
  timer: { icon: '⏱', width: 210, height: 0 }
};

/** Название вида виджета на текущем языке. */
const kindName = type => t('widget.' + type);

/** Цвета виджета: «auto» — в цвет темы, остальные — светлые пастельные. */
const COLORS = ['auto', '#fff8b8', '#ffd9e3', '#d3f5e1', '#d6e8ff'];

const elements = new Map(); // id виджета → его элемент

const widgetById = id => S.widgets.find(widget => widget.id === id);

/* ---- Создание и обновление ---- */

export function addWidget(type) {
  const kind = KINDS[type];
  const offset = (S.widgets.length % 6) * 26;
  S.widgets.push({
    id: uid(),
    type,
    title: kindName(type),
    x: 24 + offset,
    y: 110 + offset,
    w: kind.width,
    h: kind.height,
    color: 'auto',
    collapsed: false,
    data: {}
  });
  save();
  syncWidgets();
}

function paintWidget(widget, element) {
  Object.assign(element.style, {
    left: widget.x + 'px',
    top: widget.y + 'px',
    width: widget.w + 'px',
    height: widget.collapsed || !widget.h ? '' : widget.h + 'px'
  });
  if (widget.color === 'auto') {
    element.style.removeProperty('--widget-color');
    element.style.removeProperty('--widget-text');
  } else {
    element.style.setProperty('--widget-color', widget.color);
    element.style.setProperty('--widget-text', '#222');
  }
  element.classList.toggle('collapsed', Boolean(widget.collapsed));
  element.querySelector('.widget-title').value = widget.title;
  element.querySelector('.collapse').textContent = widget.collapsed ? '▸' : '▾';
}

/** Приводит элементы на странице в соответствие с S.widgets. */
export function syncWidgets() {
  const layer = $('#widget-layer');
  const ids = new Set(S.widgets.map(widget => widget.id));

  for (const [id, element] of elements) {
    if (!ids.has(id)) { element.remove(); elements.delete(id); }
  }
  for (const widget of S.widgets) {
    let element = elements.get(widget.id);
    if (!element) {
      element = buildWidget(widget);
      elements.set(widget.id, element);
      layer.append(element);
    }
    paintWidget(widget, element);
  }
}

/** Удаляет все элементы (нужно, когда данные заменены целиком). */
export function clearWidgets() {
  elements.forEach(element => element.remove());
  elements.clear();
}

/* ---- Каркас виджета ---- */

function buildWidget(initial) {
  const id = initial.id;
  const current = () => widgetById(id);
  const element = h('div', { class: 'widget widget-' + initial.type, dataset: { id } },
    h('div', { class: 'widget-header' },
      h('input', { class: 'widget-title', spellcheck: 'false' }),
      h('button', { type: 'button', class: 'widget-btn color', title: t('widget.color') }, '◐'),
      h('button', { type: 'button', class: 'widget-btn collapse', title: t('widget.collapse') }, '▾'),
      h('button', { type: 'button', class: 'widget-btn remove', title: t('item.delete') }, '✕')
    ),
    h('div', { class: 'widget-body' }),
    h('div', { class: 'resize-handle', title: t('widget.resize') })
  );

  const part = selector => element.querySelector(selector);

  part('.widget-title').onchange = event => { current().title = event.target.value; save(); };
  part('.color').onclick = () => {
    const widget = current();
    widget.color = COLORS[(COLORS.indexOf(widget.color) + 1) % COLORS.length];
    save();
    paintWidget(widget, element);
  };
  part('.collapse').onclick = () => {
    const widget = current();
    widget.collapsed = !widget.collapsed;
    save();
    paintWidget(widget, element);
  };
  part('.remove').onclick = () => {
    const widget = current();
    const hasContent = widget.data.text || (widget.data.items ?? []).length;
    if (hasContent && !confirm(t('widget.deleteConfirm', { title: widget.title }))) return;
    S.widgets.splice(S.widgets.indexOf(widget), 1);
    save();
    syncWidgets();
  };

  makeMovable(part('.widget-header'), element, current);
  makeResizable(part('.resize-handle'), element, current);
  BODY_BUILDERS[initial.type](part('.widget-body'), current);
  return element;
}

/** Перетаскивание за заголовок. */
function makeMovable(header, element, current) {
  header.onpointerdown = event => {
    if (event.target.closest('button, input')) return;
    const widget = current();
    const offsetX = event.clientX - widget.x;
    const offsetY = event.clientY - widget.y;
    header.setPointerCapture(event.pointerId);
    document.body.classList.add('dragging-block');
    header.onpointermove = move => {
      widget.x = Math.max(0, snapValue(move.clientX - offsetX));
      widget.y = Math.max(0, snapValue(move.clientY - offsetY));
      paintWidget(widget, element);
    };
    header.onpointerup = () => {
      header.onpointermove = header.onpointerup = null;
      document.body.classList.remove('dragging-block');
      save();
    };
  };
}

/** Изменение размера за правый нижний угол. */
function makeResizable(handle, element, current) {
  handle.onpointerdown = event => {
    event.preventDefault();
    event.stopPropagation();
    const widget = current();
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    handle.setPointerCapture(event.pointerId);
    document.body.classList.add('dragging-block');
    handle.onpointermove = move => {
      widget.w = Math.max(160, snapValue(width + move.clientX - event.clientX));
      widget.h = Math.max(70, snapValue(height + move.clientY - event.clientY));
      paintWidget(widget, element);
    };
    handle.onpointerup = () => {
      handle.onpointermove = handle.onpointerup = null;
      document.body.classList.remove('dragging-block');
      save();
    };
  };
}

/* ---- Содержимое виджетов ---- */

const beep = () => {
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    oscillator.connect(audio.destination);
    oscillator.frequency.value = 880;
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.4);
  } catch { /* звук недоступен */ }
};

/** Запускает tick раз в interval мс, пока элемент находится на странице. */
function repeatWhileAttached(body, interval, tick) {
  const timer = setInterval(() => (body.isConnected ? tick() : clearInterval(timer)), interval);
}

const BODY_BUILDERS = {
  note(body, current) {
    const area = document.createElement('textarea');
    area.placeholder = t('note.placeholder');
    area.value = current().data.text || '';
    let timer;
    area.oninput = () => {
      current().data.text = area.value;
      clearTimeout(timer);
      timer = setTimeout(save, 300);
    };
    area.onblur = () => save();
    body.append(area);
  },

  todo(body, current) {
    const list = document.createElement('div');
    const input = document.createElement('input');
    input.placeholder = t('todo.placeholder');

    const draw = () => {
      list.replaceChildren();
      (current().data.items ?? []).forEach((item, index) => {
        const row = document.createElement('label');
        row.className = 'todo-item' + (item.d ? ' done' : '');

        const check = document.createElement('input');
        check.type = 'checkbox';
        check.checked = Boolean(item.d);
        check.onchange = () => { item.d = check.checked; save(); draw(); };

        const text = document.createElement('span');
        text.textContent = item.t;

        const remove = document.createElement('button');
        remove.textContent = '✕';
        remove.onclick = event => {
          event.preventDefault();
          current().data.items.splice(index, 1);
          save();
          draw();
        };

        row.append(check, text, remove);
        list.append(row);
      });
    };

    input.onkeydown = event => {
      if (event.key !== 'Enter' || !input.value.trim()) return;
      const data = current().data;
      (data.items = data.items ?? []).push({ t: input.value.trim(), d: false });
      input.value = '';
      save();
      draw();
    };

    body.append(list, input);
    draw();
  },

  count(body, current) {
    const output = document.createElement('div');
    output.className = 'big-number';
    const input = document.createElement('input');
    input.type = 'datetime-local';
    input.value = current().data.at || '';

    const draw = () => {
      const target = current().data.at;
      if (!target) { output.textContent = t('count.pick'); return; }
      const diff = new Date(target) - Date.now();
      const abs = Math.abs(diff);
      const days = Math.floor(abs / 864e5);
      const hours = Math.floor((abs % 864e5) / 36e5);
      const minutes = Math.floor((abs % 36e5) / 6e4);
      const time = (days ? `${days} ${t('unit.day')} ` : '') + `${hours} ${t('unit.hour')} ${minutes} ${t('unit.minute')}`;
      output.textContent = t(diff < 0 ? 'count.past' : 'count.left', { time });
    };

    input.onchange = () => { current().data.at = input.value; save(); draw(); };
    draw();
    repeatWhileAttached(body, 30000, draw);
    body.append(output, input);
  },

  timer(body, current) {
    const output = document.createElement('div');
    output.className = 'big-number';
    const buttons = document.createElement('div');
    buttons.className = 'widget-buttons';
    const minutes = document.createElement('input');
    minutes.type = 'number';
    minutes.min = 1;
    minutes.title = t('timer.minutes');
    minutes.value = current().data.min || 25;

    const remaining = () => {
      const d = current().data;
      if (d.end) return Math.max(0, d.end - Date.now());
      return d.left == null ? (d.min || 25) * 6e4 : d.left;
    };
    const draw = () => {
      const seconds = Math.ceil(remaining() / 1000);
      output.textContent = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
    };
    const addButton = (label, action) => {
      const button = document.createElement('button');
      button.textContent = label;
      button.onclick = action;
      buttons.append(button);
    };

    addButton('▶', () => {
      const d = current().data;
      d.end = Date.now() + (remaining() || (d.min || 25) * 6e4);
      save();
    });
    addButton('❚❚', () => {
      const d = current().data;
      d.left = remaining();
      d.end = 0;
      save();
      draw();
    });
    addButton('↺', () => {
      const d = current().data;
      d.left = null;
      d.end = 0;
      save();
      draw();
    });
    minutes.onchange = () => {
      const d = current().data;
      d.min = Math.max(1, Number(minutes.value) || 25);
      d.left = null;
      d.end = 0;
      save();
      draw();
    };

    repeatWhileAttached(body, 500, () => {
      const d = current().data;
      draw();
      if (d.end && d.end <= Date.now()) {
        d.end = 0;
        d.left = 0;
        save();
        beep();
        toast(t('timer.done', { title: current().title }));
      }
    });

    draw();
    body.append(output, buttons, minutes);
  }
};

/* ---- Окно добавления ---- */

export function openAddWidget() {
  const buttons = Object.entries(KINDS).map(([type, kind]) =>
    h('button', { type: 'button', dataset: { type } }, h('b', {}, kind.icon), ' ' + kindName(type))
  );
  const dialog = openModal(
    h('h3', {}, t('widget.add')),
    h('div', { class: 'widget-types' }, buttons),
    h('div', { class: 'buttons' }, h('button', { type: 'button', dataset: { close: '1' } }, t('common.close')))
  );
  dialog.onclick = event => {
    const type = event.target.closest('[data-type]')?.dataset.type;
    if (type) { addWidget(type); dialog.close(); }
    if (event.target.closest('[data-close]')) dialog.close();
  };
}
