import { WindowService, TabService } from "@services";
import { TabActions } from "@actions";
import type { TabGroup } from "@root/models";

/**
 * Save all tabs in the specified window
 */
export function saveWindow(windowId: number): Promise<TabGroup> {
  return new Promise((resolve, reject) => {
    TabService.getTabsInWindow(windowId).then((tabs) => {
      TabActions.saveTabs(tabs).then(resolve).catch(reject);
    });
  });
}

/**
 * Save all tabs in the specified window and then close it
 */
export function sleepWindow(windowId: number): Promise<TabGroup> {
  return new Promise((resolve, reject) => {
    saveWindow(windowId).then((group) => {
      WindowService.getAllWindows().then((windows) => {
        if (windows.length === 1) WindowService.createWindow([]);

        WindowService.closeWindow(windowId).then(() => resolve(group));
      });
    });
  });
}
