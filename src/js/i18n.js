/**
 * Локализация интерфейса (русский и английский).
 * Язык выбирается в настройках: «auto» берёт язык браузера.
 * Модуль ни от чего не зависит, поэтому его можно импортировать откуда угодно.
 */

export const LANGUAGES = ['ru', 'en'];

const MESSAGES = {
  ru: {
    // Общее
    newTab: 'Новая вкладка',
    folder: 'Папка',
    untitled: 'Без названия',
    mirrorFolder: 'Табло',
    'pill.translate': 'Google Переводчик',
    'common.close': 'Закрыть',

    // newtab.html
    'html.more': 'Ещё',
    'html.drag': 'Перетащить',
    'html.dragBlock': 'Перетащить блок',
    'html.searchPlaceholder': 'Найти или открыть',
    'html.searchImage': 'Поиск по картинке',
    'html.bookmarkPrompt': 'Показать сайты с панели закладок на плитках?',
    'html.bookmarkAllow': 'Разрешить доступ к закладкам',
    'html.bookmarkDismiss': 'Не сейчас',
    'html.editHint': 'Режим правки: тяните ✥ у блоков',
    'html.editReset': 'Сбросить расположение',
    'html.editDone': 'Готово',
    'html.folderName': 'Название папки',
    'html.siteName': 'Название',
    'html.siteUrl': 'Адрес',
    'html.siteColor': 'Цвет плитки',
    'html.siteIcon': 'Своя иконка',
    'html.folderBlur': 'Размыть значки этой папки',
    'html.cancel': 'Отмена',
    'html.save': 'Сохранить',

    // Главное меню
    'menu.edit': 'Режим правки (перетаскивание блоков)',
    'menu.addWidget': 'Добавить виджет…',
    'menu.changeBg': 'Сменить фон…',
    'menu.resetBg': 'Вернуть стандартный фон',
    'menu.importBookmarks': 'Импортировать закладки',
    'menu.data': 'Экспорт / импорт данных…',
    'menu.settings': 'Настройки…',

    // Закладки
    'bm.denied': 'Доступ к закладкам не разрешён',
    'bm.added': 'Добавлено из закладок: {n}',
    'bm.none': 'На панели закладок нет новых сайтов',
    'bm.failed': 'Не удалось прочитать закладки: {message}',

    // Погода
    'weather.addCity': '＋ добавить город',
    'weather.notFound': 'город не найден',
    'weather.unavailable': 'погода недоступна',

    // Режим правки, быстрые ссылки
    'layout.hint': 'Тяните значок ✥ над блоками. Виджеты двигаются за заголовок.',
    'pills.add': 'Добавить быструю ссылку',

    // Сайты и папки
    'site.unsafeOpen': 'Этот адрес открыть нельзя',
    'site.unsafeAdd': 'Этот адрес добавить нельзя',
    'item.edit': 'Изменить',
    'item.delete': 'Удалить',
    'item.addSite': 'Добавить сайт',
    'dialog.addSite': 'Добавить сайт',
    'dialog.addFolder': 'Добавить папку',
    'dialog.editSite': 'Изменить сайт',
    'dialog.editFolder': 'Изменить папку',

    // Виджеты
    'widget.note': 'Заметка',
    'widget.todo': 'Задачи',
    'widget.count': 'Отсчёт до даты',
    'widget.timer': 'Таймер',
    'widget.add': 'Добавить виджет',
    'widget.color': 'Цвет: как тема / пастельные',
    'widget.collapse': 'Свернуть / развернуть',
    'widget.resize': 'Потяните, чтобы изменить размер',
    'widget.deleteConfirm': 'Удалить «{title}»?',
    'note.placeholder': 'Пишите здесь…',
    'todo.placeholder': 'Новая задача — Enter',
    'count.pick': 'Выберите дату ↓',
    'count.past': 'прошло {time}',
    'count.left': 'осталось {time}',
    'unit.day': 'д',
    'unit.hour': 'ч',
    'unit.minute': 'мин',
    'timer.minutes': 'Минут',
    'timer.done': '⏱ Таймер «{title}» завершён',

    // Экспорт и импорт
    'data.title': 'Экспорт / импорт',
    'data.hint':
      'В экспорт попадает только изменённое: настройки, отличающиеся от стандартных, и непустые разделы. ' +
      'Закладки сюда не входят — их хранит сам браузер. Текст ниже можно скопировать, сохранить в файл ' +
      'или вставить сюда и применить.',
    'data.opts': 'Настройки',
    'data.pills': 'Быстрые ссылки',
    'data.widgets': 'Виджеты и заметки',
    'data.layout': 'Расположение блоков',
    'data.bg': 'Фон-картинка (тяжёлая)',
    'data.replace': 'При импорте заменять плитки и виджеты (иначе добавляются только новые)',
    'data.copy': 'Копировать',
    'data.download': 'Скачать файл',
    'data.upload': 'Загрузить файл…',
    'data.apply': 'Применить текст',
    'data.badJson': 'Не удалось прочитать: это не JSON',
    'data.notTablo': 'Это не данные табло',
    'data.applied': 'Данные применены',
    'data.copied': 'Скопировано в буфер',

    // Панель настроек
    'settings.title': 'Настройки',
    'settings.close': 'Закрыть',
    'settings.resetOne': 'Сбросить к стандартному',
    'settings.export': 'Экспорт / импорт…',
    'settings.resetAll': 'Сбросить всё',
    'settings.resetConfirm': 'Сбросить все настройки к стандартным? Плитки и виджеты не затрагиваются.',
    'settings.credit': 'Создатель — Btw.kek',

    'sec.language': 'Язык',
    'sec.appearance': 'Оформление',
    'sec.darkUi': 'Тёмные элементы',
    'sec.tab': 'Вкладка браузера',
    'sec.clock': 'Часы',
    'sec.search': 'Поиск и быстрые ссылки',
    'sec.tiles': 'Плитки',
    'sec.drag': 'Перетаскивание',
    'sec.bookmarks': 'Папки и закладки',

    'opt.language': 'Язык интерфейса',
    'choice.langAuto': 'Автоматически (как в браузере)',
    'opt.theme': 'Тема',
    'choice.themeAuto': 'Авто: днём светлая, ночью тёмная',
    'choice.themeRandom': 'Случайная при каждом открытии',
    'choice.themeCustom': 'Свои цвета',
    'theme.light': 'Светлая',
    'theme.vivid': 'Яркая',
    'theme.blue': 'Голубая',
    'theme.mint': 'Мятная',
    'theme.sunset': 'Закат',
    'theme.ocean': 'Океан',
    'theme.forest': 'Лес',
    'theme.graphite': 'Графит',
    'theme.dark': 'Тёмная',
    'opt.gradientFrom': 'Свой цвет сверху',
    'opt.gradientTo': 'Свой цвет снизу',
    'opt.gradientAngle': 'Наклон градиента',
    'opt.blur': 'Размытие фона',
    'opt.textAuto': 'Цвет текста по теме',
    'opt.textColor': 'Свой цвет текста',
    'opt.darkElements': 'Поиск, плитки, меню',
    'choice.darkAuto': 'Автоматически по теме',
    'choice.darkOn': 'Всегда тёмные',
    'choice.darkOff': 'Всегда светлые',
    'opt.tabTitle': 'Название вкладки',
    'opt.tabIcon': 'Значок вкладки',
    'choice.tabEmoji': 'Эмодзи',
    'choice.tabBg': 'Под цвет или картинку фона',
    'choice.tabNone': 'Пустой',
    'opt.tabEmoji': 'Эмодзи для значка',
    'opt.showClock': 'Показывать часы',
    'opt.clockSize': 'Размер',
    'opt.clockWeight': 'Толщина шрифта',
    'opt.clockTop': 'Отступ сверху',
    'opt.showSeconds': 'Секунды',
    'opt.hour12': '12-часовой формат',
    'opt.showDate': 'Показывать дату',
    'opt.showWeather': 'Показывать погоду',
    'opt.city': 'Город для погоды',
    'ph.city': 'Название города',
    'opt.showSearch': 'Показывать поиск',
    'opt.searchEngine': 'Поисковик',
    'choice.engineBrowser': 'Как в браузере',
    'opt.showPills': 'Показывать быстрые ссылки',
    'opt.columns': 'Колонок',
    'opt.tileHeight': 'Высота плитки',
    'opt.tileRadius': 'Скругление',
    'opt.tileGap': 'Расстояние',
    'opt.contentWidth': 'Ширина блока',
    'opt.colorTiles': 'Цветные плитки (заливка по цвету значка)',
    'opt.colorTilesStrength': 'Насыщенность заливки',
    'opt.colorTilesGradient': 'Градиент в заливке',
    'html.fillMode': 'Заливка плитки',
    'html.fillStrength': 'Насыщенность заливки',
    'html.fillGradient': 'Градиент',
    'html.eyedropper': 'Пипетка',
    'picker.hint': 'Нажмите на любой цвет на странице. Esc — отмена.',
    'fill.default': 'Как в настройках',
    'fill.icon': 'По цвету значка',
    'fill.color': 'Свой цвет',
    'fill.none': 'Без заливки',
    'fill.on': 'Включён',
    'fill.off': 'Выключен',
    'menu.iconAccess': 'Разрешить доступ к значкам (точные цвета плиток)',
    'colorTiles.denied': 'Без доступа к значкам цвета плиток приблизительные',
    'opt.showLabels': 'Подписи под иконками',
    'opt.showFolderIcons': 'Иконки сайтов на плитке папки',
    'opt.openInNewTab': 'Открывать сайты в новой вкладке',
    'opt.snapStep': 'Шаг сетки, px (0 — выкл.)',
    'opt.unblurOnHover': 'Убирать размытие значков папки при наведении',
    'opt.bookmarkSource': 'Откуда брать закладки',
    'choice.bmAll': 'Панель, меню и «Другие закладки»',
    'choice.bmToolbar': 'Только панель закладок',
    'opt.mirrorBookmarks': 'Копировать плитки в закладки «Табло» (синхронизация Firefox)'
  },

  en: {
    // Common
    newTab: 'New Tab',
    folder: 'Folder',
    untitled: 'Untitled',
    mirrorFolder: 'Tablo',
    'pill.translate': 'Google Translate',
    'common.close': 'Close',

    // newtab.html
    'html.more': 'More',
    'html.drag': 'Drag',
    'html.dragBlock': 'Drag block',
    'html.searchPlaceholder': 'Search or enter address',
    'html.searchImage': 'Search by image',
    'html.bookmarkPrompt': 'Show sites from your bookmarks toolbar as tiles?',
    'html.bookmarkAllow': 'Allow bookmark access',
    'html.bookmarkDismiss': 'Not now',
    'html.editHint': 'Edit mode: drag the ✥ handles on blocks',
    'html.editReset': 'Reset layout',
    'html.editDone': 'Done',
    'html.folderName': 'Folder name',
    'html.siteName': 'Name',
    'html.siteUrl': 'Address',
    'html.siteColor': 'Tile color',
    'html.siteIcon': 'Custom icon',
    'html.folderBlur': 'Blur icons in this folder',
    'html.cancel': 'Cancel',
    'html.save': 'Save',

    // Main menu
    'menu.edit': 'Edit mode (drag blocks)',
    'menu.addWidget': 'Add widget…',
    'menu.changeBg': 'Change background…',
    'menu.resetBg': 'Restore default background',
    'menu.importBookmarks': 'Import bookmarks',
    'menu.data': 'Export / import data…',
    'menu.settings': 'Settings…',

    // Bookmarks
    'bm.denied': 'Bookmark access was not granted',
    'bm.added': 'Added from bookmarks: {n}',
    'bm.none': 'No new sites in your bookmarks',
    'bm.failed': 'Could not read bookmarks: {message}',

    // Weather
    'weather.addCity': '＋ add city',
    'weather.notFound': 'city not found',
    'weather.unavailable': 'weather unavailable',

    // Edit mode, quick links
    'layout.hint': 'Drag the ✥ handle above a block. Widgets move by their title bar.',
    'pills.add': 'Add quick link',

    // Sites and folders
    'site.unsafeOpen': 'This address cannot be opened',
    'site.unsafeAdd': 'This address cannot be added',
    'item.edit': 'Edit',
    'item.delete': 'Delete',
    'item.addSite': 'Add site',
    'dialog.addSite': 'Add site',
    'dialog.addFolder': 'Add folder',
    'dialog.editSite': 'Edit site',
    'dialog.editFolder': 'Edit folder',

    // Widgets
    'widget.note': 'Note',
    'widget.todo': 'To-do',
    'widget.count': 'Countdown',
    'widget.timer': 'Timer',
    'widget.add': 'Add widget',
    'widget.color': 'Color: theme / pastel',
    'widget.collapse': 'Collapse / expand',
    'widget.resize': 'Drag to resize',
    'widget.deleteConfirm': 'Delete “{title}”?',
    'note.placeholder': 'Write here…',
    'todo.placeholder': 'New task — press Enter',
    'count.pick': 'Pick a date ↓',
    'count.past': '{time} ago',
    'count.left': '{time} left',
    'unit.day': 'd',
    'unit.hour': 'h',
    'unit.minute': 'min',
    'timer.minutes': 'Minutes',
    'timer.done': '⏱ Timer “{title}” finished',

    // Export and import
    'data.title': 'Export / import',
    'data.hint':
      'Only changed data is exported: settings that differ from the defaults and non-empty sections. ' +
      'Bookmarks are not included, the browser stores them itself. You can copy the text below, ' +
      'save it to a file, or paste text here and apply it.',
    'data.opts': 'Settings',
    'data.pills': 'Quick links',
    'data.widgets': 'Widgets and notes',
    'data.layout': 'Block layout',
    'data.bg': 'Background image (large)',
    'data.replace': 'On import, replace tiles and widgets (otherwise only new ones are added)',
    'data.copy': 'Copy',
    'data.download': 'Download file',
    'data.upload': 'Load file…',
    'data.apply': 'Apply text',
    'data.badJson': 'Could not read: this is not valid JSON',
    'data.notTablo': 'This is not Tablo data',
    'data.applied': 'Data applied',
    'data.copied': 'Copied to clipboard',

    // Settings panel
    'settings.title': 'Settings',
    'settings.close': 'Close',
    'settings.resetOne': 'Reset to default',
    'settings.export': 'Export / import…',
    'settings.resetAll': 'Reset all',
    'settings.resetConfirm': 'Reset all settings to their defaults? Tiles and widgets are not affected.',
    'settings.credit': 'Created by Btw.kek',

    'sec.language': 'Language',
    'sec.appearance': 'Appearance',
    'sec.darkUi': 'Dark elements',
    'sec.tab': 'Browser tab',
    'sec.clock': 'Clock',
    'sec.search': 'Search and quick links',
    'sec.tiles': 'Tiles',
    'sec.drag': 'Dragging',
    'sec.bookmarks': 'Folders and bookmarks',

    'opt.language': 'Interface language',
    'choice.langAuto': 'Automatic (browser language)',
    'opt.theme': 'Theme',
    'choice.themeAuto': 'Auto: light by day, dark at night',
    'choice.themeRandom': 'Random on every open',
    'choice.themeCustom': 'Custom colors',
    'theme.light': 'Light',
    'theme.vivid': 'Vivid',
    'theme.blue': 'Sky',
    'theme.mint': 'Mint',
    'theme.sunset': 'Sunset',
    'theme.ocean': 'Ocean',
    'theme.forest': 'Forest',
    'theme.graphite': 'Graphite',
    'theme.dark': 'Dark',
    'opt.gradientFrom': 'Custom top color',
    'opt.gradientTo': 'Custom bottom color',
    'opt.gradientAngle': 'Gradient angle',
    'opt.blur': 'Background blur',
    'opt.textAuto': 'Text color from theme',
    'opt.textColor': 'Custom text color',
    'opt.darkElements': 'Search, tiles, menus',
    'choice.darkAuto': 'Automatic, follows the theme',
    'choice.darkOn': 'Always dark',
    'choice.darkOff': 'Always light',
    'opt.tabTitle': 'Tab title',
    'opt.tabIcon': 'Tab icon',
    'choice.tabEmoji': 'Emoji',
    'choice.tabBg': 'Matches the background',
    'choice.tabNone': 'Blank',
    'opt.tabEmoji': 'Emoji for the icon',
    'opt.showClock': 'Show clock',
    'opt.clockSize': 'Size',
    'opt.clockWeight': 'Font weight',
    'opt.clockTop': 'Top margin',
    'opt.showSeconds': 'Seconds',
    'opt.hour12': '12-hour format',
    'opt.showDate': 'Show date',
    'opt.showWeather': 'Show weather',
    'opt.city': 'City for weather',
    'ph.city': 'City name',
    'opt.showSearch': 'Show search',
    'opt.searchEngine': 'Search engine',
    'choice.engineBrowser': 'Browser default',
    'opt.showPills': 'Show quick links',
    'opt.columns': 'Columns',
    'opt.tileHeight': 'Tile height',
    'opt.tileRadius': 'Corner radius',
    'opt.tileGap': 'Spacing',
    'opt.contentWidth': 'Block width',
    'opt.colorTiles': 'Colored tiles (fill from the icon color)',
    'opt.colorTilesStrength': 'Fill strength',
    'opt.colorTilesGradient': 'Gradient in fill',
    'html.fillMode': 'Tile fill',
    'html.fillStrength': 'Fill strength',
    'html.fillGradient': 'Gradient',
    'html.eyedropper': 'Eyedropper',
    'picker.hint': 'Click any color on the page. Esc to cancel.',
    'fill.default': 'As in settings',
    'fill.icon': 'From icon color',
    'fill.color': 'Custom color',
    'fill.none': 'No fill',
    'fill.on': 'On',
    'fill.off': 'Off',
    'menu.iconAccess': 'Allow icon access (exact tile colors)',
    'colorTiles.denied': 'Without access to icons, tile colors are approximate',
    'opt.showLabels': 'Labels under icons',
    'opt.showFolderIcons': 'Site icons on folder tiles',
    'opt.openInNewTab': 'Open sites in a new tab',
    'opt.snapStep': 'Grid step, px (0 = off)',
    'opt.unblurOnHover': 'Remove folder icon blur on hover',
    'opt.bookmarkSource': 'Bookmarks source',
    'choice.bmAll': 'Toolbar, menu and “Other Bookmarks”',
    'choice.bmToolbar': 'Bookmarks toolbar only',
    'opt.mirrorBookmarks': 'Copy tiles to the “Tablo” bookmarks folder (Firefox Sync)'
  }
};

/** Все названия папки-зеркала в закладках (для поиска уже существующей). */
export const MIRROR_FOLDER_NAMES = [MESSAGES.ru.mirrorFolder, MESSAGES.en.mirrorFolder];

/** Язык браузера: русский, если он русский, иначе английский. */
export function detectLanguage() {
  const ui = (typeof browser !== 'undefined' && browser.i18n?.getUILanguage?.()) || navigator.language || 'en';
  return ui.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

let current = detectLanguage();

/** preference — 'ru', 'en' или 'auto' (язык браузера). */
export function setLanguage(preference) {
  current = LANGUAGES.includes(preference) ? preference : detectLanguage();
}

export const getLanguage = () => current;

/** Локаль для форматирования даты и времени. */
export const locale = () => (current === 'ru' ? 'ru-RU' : 'en-GB');

/**
 * Возвращает строку на текущем языке. Параметры подставляются вместо {name}.
 * Если ключа нет, берётся английский вариант, а затем сам ключ.
 */
export function t(key, params) {
  const text = MESSAGES[current]?.[key] ?? MESSAGES.en[key] ?? key;
  return params ? text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? params[name] : match)) : text;
}

/**
 * Переводит статическую разметку: data-i18n (текст), data-i18n-title,
 * data-i18n-placeholder и data-i18n-aria (атрибут aria-label).
 */
export function translateDom(root = document) {
  document.documentElement.lang = current;
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-title]')) el.title = t(el.dataset.i18nTitle);
  for (const el of root.querySelectorAll('[data-i18n-placeholder]')) el.placeholder = t(el.dataset.i18nPlaceholder);
  for (const el of root.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
}
