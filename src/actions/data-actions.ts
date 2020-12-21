import { TabGroup } from '@models';

/**
 * Export all data in JSON format
 */
export function exportJson(tabGroups) {
  return new Promise((resolve, reject) => {
    Promise.resolve(tabGroups)
      .then(tabGroups => {
        return tabGroups.map(tabGroup => {
          // Strip any group UUIDs that are present
          let { uuid, ...group } = tabGroup;

          return group;
        });
      })
      .then(tabGroups => ({
        tabGroups,
        version: '1',
        exportedAt: new Date()
      }))
      .then(data => JSON.stringify(data, null, 2))
      .then(resolve)
      .catch(reject);
  });
}

/**
 * Import supplied JSON data
 */
export function importJson(json) {
  const { version, tabGroups } = JSON.parse(json);

  if (version !== "1") {
    throw `Unrecognized file version: ${version}`
  }

  return new Promise((resolve, reject) => {
    Promise.all(
      tabGroups.map(group => new TabGroup(group).save())
    )
      .then(resolve)
      .catch(reject);
  });
}
