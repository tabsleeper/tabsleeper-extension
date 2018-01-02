export default class WindowService {
  /**
   * Get a list of all currently open, regular windows
   */
  static getAllWindows() {
    return new Promise((resolve, reject) => {
      browser.windows.getAll({ windowTypes: ['normal'] })
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Get the currently focused window
   */
  static getCurrentWindow() {
    return new Promise((resolve, reject) => {
      browser.windows.getCurrent({ populate: true })
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Create a new window with tabs for the specified list of urls
   */
  static createWindow(urls) {
    return new Promise((resolve, reject) => {
      const payload = {
        url: urls,
        focused: true,
      };

      // Firefox does not support the focused property
      if (InstallTrigger) {
        delete payload.focused;
      }


      browser.windows.create(payload)
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Close the specified window
   */
  static closeWindow(id) {
    return new Promise((resolve, reject) => {
      browser.windows.remove(id)
        .then(() => resolve())
        .catch(reject);
    });
  }
}
