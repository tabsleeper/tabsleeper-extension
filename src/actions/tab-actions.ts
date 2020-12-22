import { TabGroup } from '@models';
import { TabService } from '@services';
import type { TabInfo } from '@root/database';

/**
 * Save the specified tabs
 */
export function saveTabs(tabs: browser.tabs.Tab[]): Promise<TabGroup> {
  return new Promise((resolve, reject) => {
    let group = new TabGroup({ tabs });

    group.save()
      .then(resolve)
      .catch(reject);
  });
}

/**
 * Save the specified tabs and then close them
 */
export function sleepTabs(tabs: browser.tabs.Tab[]): Promise<TabGroup> {
  return new Promise((resolve, reject) => {
    saveTabs(tabs)
      .then((group) => {
        TabService.closeTabs(tabs).then(tabs => resolve(group)).catch(reject);
      })
  });
}
