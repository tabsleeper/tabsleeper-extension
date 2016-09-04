import UUID from 'node-uuid';

import constants from '../constants';
import Database from '../database';

/**
 * Represents a group of suspended tabs, backed by IndexedDB
 */
export class TabGroup {

  uuid;

  tabs;

  constructor({ uuid = UUID.v4(), name, tabs, createdAt, updatedAt }) {
    this.uuid = uuid;
    this.name = name;
    this.tabs = tabs;
    this.createdAt = (createdAt) ? Date.parse(createdAt) : new Date();
    this.updatedAt = (updatedAt) ? Date.parse(updatedAt) : new Date();
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
    let db = new Database();
    db.open();

    return new Promise((resolve, reject) => {
      db.groups.add({
        uuid: this.uuid,
        name: this.name,
        tabs: this.tabs,
        createdAt: this.createdAt,
        updatedAt: new Date()
      })
        .then(() => {
          chrome.runtime.sendMessage(constants.CHANGE);
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
    let db = new Database();
    db.open();

    return new Promise((resolve, reject) => {
      db.groups.delete(this.uuid)
        .then(() => {
          chrome.runtime.sendMessage(constants.CHANGE);
          resolve(this);
        })
        .catch(err => reject(err));
    });
  }

}

export default TabGroup;
