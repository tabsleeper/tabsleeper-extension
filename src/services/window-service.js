export default class WindowService {
  /**
   * Get a list of all currently open, regular windows
   */
  static getAllWindows() {
    return new Promise((resolve, reject) => {
      chrome.windows.getAll({ windowTypes: ['normal'] }, (windows) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(windows);
        }
      });
    });
  }

  /**
   * Get the currently focused window
   */
  static getCurrentWindow() {
    return new Promise((resolve, reject) => {
      chrome.windows.getCurrent({ populate: true }, (win) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(win);
        }
      });
    });
  }

  /**
   * Create a new window with tabs for the specified list of urls
   */
  static createWindow(urls) {
    return new Promise((resolve, reject) => {
      chrome.windows.create({ url: urls, focused: true }, (win) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(win);
        }
      });
    });
  }

  /**
   * Close the specified window
   */
  static closeWindow(id) {
    return new Promise((resolve, reject) => {
      chrome.windows.remove(id, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}
