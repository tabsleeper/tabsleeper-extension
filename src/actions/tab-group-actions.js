import { TabService, WindowService } from 'services';

/**
 * Creates a new window from the group's tab URLs, and then destroys the group
 */
export function wakeGroup(group) {
  return new Promise((resolve, reject) => {
    TabService.getCurrentTab().then((tab) => {
      let urls = group.getTabs().map(t => t.url);

      group.destroy().then(() => {
        WindowService.createWindow(urls).then(resolve).catch(reject);
      });
    });
  });
}
