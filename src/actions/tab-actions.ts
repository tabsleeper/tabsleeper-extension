import { TabGroup } from '@models';
import { TabService } from '@services';

/**
 * Save the specified tabs
 */
export function saveTabs(tabs) {
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
export function sleepTabs(tabs) {
  return new Promise((resolve, reject) => {
    saveTabs(tabs)
      .then((group) => {
        TabService.closeTabs(tabs).then(tabs => resolve(group)).catch(reject);
      })
  });
}
