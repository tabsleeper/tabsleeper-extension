import { TabService, WindowService } from '@services';
import type { TabGroup } from '@root/models';

/**
 * Creates a new window from the group's tab URLs, and then destroys the group
 */
export function wakeGroup(group: TabGroup): Promise<browser.windows.Window> {
  return new Promise((resolve, reject) => {
    TabService.getCurrentTab().then((tab) => {
      let urls = group.getTabs().map(t => t.url);

      group.destroy().then(() => {
        WindowService.createWindow(urls)
          .then(resolve)
          .catch(error => {
            // Attempt to preserve the group if something goes wrong closing
            // the window
            group.save();

            reject(error);
          });
      });
    });
  });
}
