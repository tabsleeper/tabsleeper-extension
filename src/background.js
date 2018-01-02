import debounce from 'lodash/debounce';

function setSelectedCount(count) {
  if (count >= 2) {
    browser.browserAction.setBadgeText({ text: `${count}` });
  } else {
    browser.browserAction.setBadgeText({ text: '' });
  }
}

function handleOnHighlighted(highlightInfo) {
  setSelectedCount(highlightInfo.tabIds.length);
}

browser.tabs.onHighlighted.addListener(debounce(handleOnHighlighted, 200));
