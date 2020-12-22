import { v4 as uuidv4 } from 'uuid';

import constants from '@root/constants';
import Database, { IGroup, TabInfo } from '@root/database';

/**
 * Represents a group of suspended tabs, backed by IndexedDB
 */
export default class TabGroup {
  uuid: string;
  name?: string;
  tabs: TabInfo[];
  createdAt: Date;
  updatedAt: Date;

  static all(): Promise<TabGroup[]> {
    const db = new Database();
    db.open();

    return new Promise((resolve, reject) => {
      db.groups.orderBy('createdAt').reverse().toArray((storedTabGroups) => {
        const tabGroups = storedTabGroups.map(g => new TabGroup(g));

        resolve(tabGroups);
      });
    });
  }

  /**
   * Attempts to read a specific tab group from the database by UUID
   */
  static read(uuid: string): Promise<TabGroup> {
    const db = new Database();
    db.open();

    return new Promise((resolve, reject) => {
      db.groups.get(uuid)
        .then(record => {
          if (record) {
            resolve(new TabGroup(record));
          } else {
            reject(null);
          }
        })
        .catch(reject);
    });
  }

  constructor({ uuid, name, tabs, createdAt, updatedAt }: { uuid?: string, name?: string, tabs: TabInfo[], createdAt?: string, updatedAt?: string }) {
    this.uuid = uuid || uuidv4();
    this.name = name;
    this.tabs = tabs;
    this.createdAt = (createdAt) ? new Date(createdAt) : new Date();
    this.updatedAt = (updatedAt) ? new Date(updatedAt) : new Date();
  }

  /**
   * Return the tabs that this group holds
   */
  getTabs(): TabInfo[] {
    return this.tabs;
  }

  /**
   * Saves the tab group to the store, resolving with the tab group.
   * If successful, broadcasts a change event.
   */
  save(): Promise<this> {
    const tabs = this.tabs.map(tab => ({
      id: tab.id,
      url: tab.url,
      favIconUrl: tab.favIconUrl,
      title: tab.title,
    }));

    const db = new Database();
    db.open();

    return new Promise((resolve, reject) => {
      db.groups.put({
        uuid: this.uuid,
        name: this.name,
        tabs,
        createdAt: this.createdAt.toJSON(),
        updatedAt: new Date().toJSON(),
      })
        .then(() => {
          browser.runtime.sendMessage(constants.CHANGE);
          resolve(this)
        })
        .catch(err => reject(err));
    });
  }

  /**
   * Destroys the tab group, resolving with the now-deleted tab group
   * If successful, broadcasts a change event.
   */
  destroy(): Promise<this> {
    const db = new Database();
    db.open();

    return new Promise((resolve, reject) => {
      db.groups.delete(this.uuid)
        .then(() => {
          browser.runtime.sendMessage(constants.CHANGE);
          resolve(this);
        })
        .catch(err => reject(err));
    });
  }
}
