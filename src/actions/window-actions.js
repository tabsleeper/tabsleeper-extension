import { WindowService, TabService } from 'services';
import { TabActions } from 'actions';

/**
 * Save all tabs in the specified window
 */
export function saveWindow(windowId) {
  return new Promise((resolve, reject) => {
    TabService.getTabsInWindow(windowId).then((tabs) => {
      TabActions.saveTabs(tabs)
        .then(resolve)
        .catch(reject);
    });
  });
}

/**
 * Save all tabs in the specified window and then close it
 */
export function sleepWindow(windowId) {
  return new Promise((resolve, reject) => {
    saveWindow(windowId)
      .then((group) => {
        WindowService.getAllWindows().then(windows => {
          if (windows.length === 1) WindowService.createWindow();
          WindowService.closeWindow(windowId).then(() => resolve(group));
        });
      });
  });
}
