import { WindowService } from '../services';

export default class TabService {
  /**
   * Return the currently focused tab
   */
  static getCurrentTab() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(tabs[0]);
        }
      });
    });
  }

  /**
   * Get all selected tabs in a given window
   */
  static getSelectedTabs(windowId) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ windowId, highlighted: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(tabs);
        }
      });
    });
  }

  /**
   * Get all tabs in a given window
   */
  static getTabsInWindow(windowId) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ windowId }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(tabs);
        }
      });
    });
  }
  
  /**
   * Close a single tab
   */
  static closeTab(tab) {
    return new Promise((resolve, reject) => {
      TabService.closeTabs([tab])
        .then(() => { resolve(tab) })
        .catch(reject);
    });
  }

  /**
   * Close all supplied tabs
   */
  static closeTabs(tabs) {
    return new Promise((resolve, reject) => {
      chrome.tabs.remove(tabs.map(t => t.id), () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(tabs);
        }
      });
    });
  }
}
