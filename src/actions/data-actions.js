import { TabGroup } from 'models';

/**
 * Export all data in JSON format
 */
export function exportJson() {
  return new Promise((resolve, reject) => {
    TabGroup.all()
      .then(tabGroups => ({
        tabGroups,
        version: '1',
        exportedAt: new Date()
      }))
      .then(JSON.stringify)
      .then(resolve)
      .catch(reject);
  });
}

/**
 * Import supplied JSON data
 */
export function importJson(json) {
  // TODO
}
