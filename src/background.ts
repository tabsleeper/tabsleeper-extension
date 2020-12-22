import { debounce } from 'lodash';

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
