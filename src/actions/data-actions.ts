import { TabGroup } from '@models';
import type { TabInfo } from '@root/database';

interface ExportedTabGroup {
  name?: string;
  tabs: TabInfo[];
  createdAt: string;
  updatedAt: string;
}

interface ExportV1 {
  version: "1";
  exportedAt: string;
  tabGroups: ExportedTabGroup[];
};

type ExportBundle = ExportV1;

/**
 * Export all data in JSON format
 */
export function exportJson(tabGroups: TabGroup[]): Promise<string> {
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
export function importJson(json: string): Promise<TabGroup[]> {
  const { version, tabGroups } = JSON.parse(json) as ExportBundle;

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
