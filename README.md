# Tablo

**English** · [Русский](README.ru.md)

A new tab page for Firefox: clock, search, site tiles, folders, quick links and a customizable background.

The interface is available in **English** and **Russian**. It follows the browser language by default and can be switched in Settings → Language.

## Features

- Clock, date and weather for a city of your choice.
- Search: addresses open directly, everything else goes to the search engine you pick (Google, DuckDuckGo, Bing or the browser default).
- Tiles and folders with drag and drop; sites can be imported from your bookmarks.
- Themes, custom gradients or your own background image. Dark elements (search, tiles, menus) switch on automatically with dark themes, or can be forced on or off.
- Edit mode: page blocks move around with snap-to-grid.
- Widgets: note, to-do list, countdown, timer.
- Export and import of settings as JSON.
- English and Russian interface.

## Installation

Requires **Firefox 140 or newer on desktop**. Firefox for Android does not support replacing the new tab page, so the extension does not work there.

Download the signed `.xpi` from the [Releases](../../releases) page and open it in Firefox.

## Development

```bash
npm install
npm start        # Firefox with the extension and live reload
npm run lint     # check the manifest and code
npm run build    # package into dist/
```

There is no build step: Firefox loads the files from `src/` as they are.

```
src/
  manifest.json
  newtab.html
  _locales/            extension name and description (en, ru)
  css/style.css      styles, light and dark palettes
  js/
    main.js          startup and rendering
    config.js        defaults, themes, migration of old data
    i18n.js          English and Russian strings, language switching
    state.js         state and storage
    theme.js         background, colors, dark elements
    grid.js          tiles, folders, drag and drop
    sites.js         icons, site dialog, context menu
    pills.js         quick links
    layout.js        edit mode and snap-to-grid
    widgets.js       widgets
    clock.js         clock and weather
    search.js        search box
    bookmarks.js     bookmarks and the "Tablo" mirror folder
    settings.js      settings panel
    dataio.js        export and import
    tabinfo.js       tab title and icon
    ui.js, events.js, util.js
```

To add a language: add a block to `MESSAGES` in `src/js/i18n.js`, the language code to `LANGUAGES`, a `_locales/<code>/messages.json` and an option in the language selector in `src/js/settings.js`.

Signing and publishing guide (in Russian): [docs/PUBLISHING.md](docs/PUBLISHING.md).

## Privacy

All data is stored locally in the browser. Only two kinds of requests leave your machine:

- **Site icons:** the domains of your tiles and quick links are requested from Google's favicon service (`google.com/s2/favicons`).
- **Weather:** the city name you enter is sent to Open-Meteo (`open-meteo.com`). No requests are made until a city is set.

Bookmark access is optional, requested separately and only with your consent. There is no analytics, advertising or tracking.

## License

[MIT](LICENSE)
