import React from 'react';

import constants from '../constants';

class TabGroup extends React.Component {

  constructor(props) {
    super(props);

    this.group = props.group;

    this.state = {
      tabs: this.group.getTabs()
    };
  }

  /**
   * Wake the tab group.
   *
   * Creates a new window containing the tabs, and closes the current NTP
   */
  onWakeClicked(evt) {
    evt.preventDefault();

    chrome.tabs.getCurrent((currentTab) => {
      chrome.windows.create({
        url: this.state.tabs.map(t => t.url),
        focused: true
      }, (win) => {
        this.group.destroy().then(() => {
          chrome.tabs.remove(currentTab.id);
        });
      });
    });
  }

  /**
   * Show the UI for renaming the tab group
   */
  onRenameClicked(evt) {
    evt.preventDefault();

    alert('TBD');
  }

  /**
   * Save any changes made to the tab group
   */
  onSaveClicked(evt) {
    evt.preventDefault();

    this.group.save();
  }

  /**
   * Destroys the tab group
   */
  onDeleteClicked(evt) {
    evt.preventDefault();
    let pluralization = (this.state.tabs.length === 0) ? '' : 's';

    if (window.confirm(`Delete ${this.state.tabs.length} tab${pluralization}?`)) {
      this.group.destroy();
    }
  }

  render() {
    let pluralization = (this.state.tabs.length === 0) ? '' : 's';

    return <div>
      <strong>
        {this.state.tabs.length} Tab{pluralization}
      </strong>

      <ul>
        <li onClick={this.onWakeClicked.bind(this)}>Wake</li>
        <li onClick={this.onRenameClicked.bind(this)}>Rename</li>
        <li onClick={this.onDeleteClicked.bind(this)}>Delete</li>
      </ul>

      <ul>
        {this.state.tabs.map(t => <li key={t.id}>{t.title} - {t.url}</li>)}
      </ul>

      <hr />
    </div>;
  }
}

export default TabGroup;
