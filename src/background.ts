import { debounce } from 'lodash';
import { TabGroup } from '@models';
import * as Messaging from '@messaging';
import { TabService, WindowService } from '@services';

function setSelectedCount(count: number) {
  if (count >= 2) {
    browser.browserAction.setBadgeText({ text: `${count}` });
  } else {
    browser.browserAction.setBadgeText({ text: '' });
  }
}

interface HighlightEvent {
  windowId: number;
  tabIds: number[];
}

function handleOnHighlighted(highlightInfo: HighlightEvent) {
  setSelectedCount(highlightInfo.tabIds.length);
}

browser.tabs.onHighlighted.addListener(debounce(handleOnHighlighted, 200));

Messaging.addListener((message) => {
  switch (message.type) {
    case Messaging.Type.WAKE_GROUP:
      TabGroup.read(message.groupId).then((group) => {
        let urls = group.getTabs().map(t => t.url);
        let pinned = group.getTabs().map(t => t.pinned);

        WindowService.createWindow(urls)
          .then((newWindow) => {
            newWindow.tabs.forEach(({ index, id }) => {
              if (pinned[index] === true) {
                TabService.updateTab(id, { pinned: true });
              }
            });

            group.destroy()

            return newWindow;
          })
      });

    case Messaging.Type.CHANGE:
    default:
      // do nothing
  }

  return false;
});
