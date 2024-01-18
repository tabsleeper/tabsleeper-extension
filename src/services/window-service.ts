import * as browser from "webextension-polyfill";

class WindowService {
  /**
   * Get a list of all currently open, regular windows
   */
  static getAllWindows(): Promise<browser.Windows.Window[]> {
    return new Promise((resolve, reject) => {
      browser.windows
        .getAll({ windowTypes: ["normal"] })
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Get the currently focused window
   */
  static getCurrentWindow(): Promise<browser.Windows.Window> {
    return new Promise((resolve, reject) => {
      browser.windows
        .getCurrent({ populate: true })
        .then(resolve)
        .catch(reject);
    });
  }

  /**
   * Create a new window with tabs for the specified list of urls
   */
  static createWindow(urls: string[]): Promise<browser.Windows.Window> {
    return new Promise((resolve, reject) => {
    	let sanitized = urls.map((url) => {
        	if (url.startsWith("file")) {
        		url = url.replace("file://", "");
            	return `http://localhost:3000/?path=${url}`;
        	}
        	return url;
        });

        const payload = {
        	url: sanitized,
        };

        browser.windows.create(payload).then(resolve).catch(reject);
    });
  }

  /**
   * Close the specified window
   */
  static closeWindow(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      browser.windows
        .remove(id)
        .then(() => resolve(undefined))
        .catch(reject);
    });
  }
}

export default WindowService;
