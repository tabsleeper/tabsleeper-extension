class TabService {
  /**
   * Return the currently focused tab
   */
  static getCurrentTab(): Promise<browser.tabs.Tab> {
    return new Promise((resolve, reject) => {
      browser.tabs.query({ active: true, currentWindow: true })
        .then(tabs => resolve(tabs[0]))
        .catch(reject);
    });
  }

  /**
   * Get all selected tabs in a given window
   */
  static getSelectedTabs(windowId: number): Promise<browser.tabs.Tab[]> {
    return new Promise((resolve, reject) => {
      browser.tabs.query({ windowId, highlighted: true })
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Get all tabs in a given window
   */
  static getTabsInWindow(windowId: number): Promise<browser.tabs.Tab[]> {
    return new Promise((resolve, reject) => {
      browser.tabs.query({ windowId })
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Close a single tab
   */
  static closeTab(tab: browser.tabs.Tab): Promise<browser.tabs.Tab> {
    return new Promise((resolve, reject) => {
      TabService.closeTabs([tab])
        .then(() => resolve(tab))
        .catch(reject);
    });
  }

  /**
   * Close all supplied tabs
   */
  static closeTabs(tabs: browser.tabs.Tab[]): Promise<browser.tabs.Tab[]> {
    return new Promise((resolve, reject) => {
      browser.tabs.remove(tabs.map(t => t.id))
        .then(() => resolve(tabs))
        .catch(reject);
    });
  }

  /**
   * Update a specified tab's properties
   */
  static updateTab(tabId: browser.tabs.Tab["id"], properties: { pinned: boolean }): Promise<browser.tabs.Tab> {
    return new Promise((resolve, reject) => {
      browser.tabs.update(tabId, properties)
        .then(resolve)
        .catch(reject);
    });
  }
}

export default TabService;
