# Changelog

**English** · [Русский](CHANGELOG.ru.md)

## 2.1.3

- Fixed deleted tiles coming back: the original bookmark address is now remembered (even if the tile's URL was edited), an emptied folder is removed, and the "Tablo" mirror folder is cleared after the last tile is deleted.

## 2.1.2

- Added tile fill from the site icon color (on by default, 90%). Strength and gradient are set in Settings → Tiles, and each tile can have its own fill mode (as in settings, from icon, custom color with an eyedropper, none) in its edit dialog.

## 2.1.1

- New extension icon: a heart on a purple-to-pink gradient.

## 2.1.1

- New extension icon: a heart on a gradient.

## 2.1.0

- Added English. The language follows the browser by default and can be changed in Settings → Language.
- The extension name and description are localized (`_locales`).
- The bookmarks mirror folder is called "Tablo" in the English interface; an existing "Табло" folder is still recognized and reused.
- Weather and image search use the interface language.

## 2.0.2

- The interface is built through the DOM, without assigning `innerHTML` (removes the AMO validator warnings).
- Minimum Firefox version is 140 (Android 142), the first to support `data_collection_permissions`.

## 2.0.1

- Widgets follow the theme color by default; the pastel colors remain in the switcher.
- Removed the greeting under the date and the tile fill taken from the icon color.
- Icons are no longer blurred inside an open folder (the blur stays on the folder tile).
- The default tab icon is the ❤️ emoji.
- Sliders in Settings show their values.
- The "⋯" button changes color with the theme.

## 2.0.0

- The code was rewritten as ES modules with a clear structure.
- Blocks in edit mode snap to the grid by their own edges instead of missing it.
- Dark elements (search, quick links, tiles, menus, the settings panel) switch on automatically with dark themes; Settings can force them on or off.
- Empty grid cells are dark and unobtrusive, tiles stand out more; cells are highlighted only while dragging.
- The settings panel is transparent like the background, with a thin outline; the author's GitHub is an icon.
- The name was removed from the greeting.
- Add-ons (a sandbox for user code) were removed; `unsafe-eval` was dropped from the permissions.
- New extension ID `tablo-newtab@btwkek`. Export your settings before upgrading from an older version.
