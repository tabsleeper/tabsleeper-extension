import TabGroup from './tab-group';
import constants from './constants';

/**
 * Creates a new snoozed group of tabs, saved in an IndexedDB store
 */
function saveTabs(tabs) {
  return new Promise((resolve, reject) => {
    let group = new TabGroup({ tabs });

    group.save()
      .then(resolve)
      .catch(reject);
  });
}

/**
 * Closes a collection of tabs using Chrome's tabs.remove API
 */
function closeTabs(tabs) {
  return new Promise((resolve, reject) => {
    chrome.tabs.remove(tabs.map(t => t.id), () => { resolve(tabs) });
  });
}

/**
 * Closes a specific window using Chrome's windows.remove API
 */
function closeWindow(win) {
  return new Promise((resolve, reject) => {
    chrome.windows.remove(win.id, () => { resolve(win) });
  });
}

chrome.browserAction.onClicked.addListener((tab) => {
  let windowId = tab.windowId;

  // Ask Chrome for all highlighted tabs. If only one tab is returned, then
  // close the whole window.
  //
  // Chrome automatically marks the current tab in a window as highlighted, so
  // this corresponds to someone clicking the browser action without
  // highlighting any tabs.
  chrome.tabs.query({ windowId, highlighted: true }, (tabs) => {

    if (tabs.length > 1) {
      // Save and close selected tabs
      saveTabs(tabs).then(group => closeTabs(group.getTabs()));

    } else {
      // Save and close the window.
      //
      // The window is closed rather than its collection of tabs so that we can
      // support Chrome's re-open behaviour correctly.
      chrome.windows.get(windowId, { populate: true }, (win) => {
        saveTabs(win.tabs).then(() => { closeWindow(win) });
      });
    }
  });
});
