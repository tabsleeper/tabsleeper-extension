import debounce from 'lodash/debounce';

function setSelectedCount(count) {
  if (count >= 2) {
    chrome.browserAction.setBadgeText({ text: `${count}` });
  } else {
    chrome.browserAction.setBadgeText({ text: '' });
  }
}

function handleOnHighlighted(highlightInfo) {
  setSelectedCount(highlightInfo.tabIds.length);
}

chrome.tabs.onHighlighted.addListener(debounce(handleOnHighlighted, 200));
