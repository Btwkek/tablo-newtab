/** Быстрые ссылки под поиском. */

import { S } from './state.js';
import { editSite, iconElement, openSite, showSiteMenu } from './sites.js';
import { t } from './i18n.js';
import { $ } from './util.js';

export function renderPills() {
  const container = $('#pills');
  container.replaceChildren();

  for (const site of S.pills) {
    const pill = document.createElement('div');
    pill.className = 'pill';

    const icon = document.createElement('div');
    icon.className = 'pill-icon';
    icon.append(iconElement(site));

    const label = document.createElement('span');
    label.textContent = site.title;

    pill.append(icon, label);
    pill.onclick = event => openSite(site.url, event);
    pill.oncontextmenu = event => showSiteMenu(event, site, S.pills);
    container.append(pill);
  }

  const add = document.createElement('div');
  add.className = 'pill add';
  add.textContent = '+';
  add.title = t('pills.add');
  add.onclick = () => editSite({ type: 'site' }, S.pills, true);
  container.append(add);
}
