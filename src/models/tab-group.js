import UUID from 'node-uuid';

import constants from 'constants.js';
import Database from 'database';

/**
 * Represents a group of suspended tabs, backed by IndexedDB
 */
export default class TabGroup {

  uuid;

  tabs;

  static all() {
    const db = new Database();
    db.open();

    return new Promise((resolve, reject) => {
      db.groups.orderBy('createdAt').reverse().toArray((tabGroups) => {
        tabGroups = tabGroups.map(g => new TabGroup(g));

        resolve(tabGroups);
      });
    });
  }

  /**
   * Attempts to read a specific tab group from the database by UUID
   */
  static read(uuid) {
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

  constructor({ uuid = UUID.v4(), name, tabs, createdAt, updatedAt }) {
    this.uuid = uuid;
    this.name = name;
    this.tabs = tabs;
    this.createdAt = (createdAt) ? new Date(createdAt) : new Date();
    this.updatedAt = (updatedAt) ? new Date(updatedAt) : new Date();
  }

  /**
   * Return the tabs that this group holds
   */
  getTabs() {
    return this.tabs;
  }

  /**
   * Saves the tab group to the store, resolving with the tab group.
   * If successful, broadcasts a change event.
   */
  save() {
    const db = new Database();
    db.open();

    return new Promise((resolve, reject) => {
      db.groups.put({
        uuid: this.uuid,
        name: this.name,
        tabs: this.tabs,
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
  destroy() {
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
