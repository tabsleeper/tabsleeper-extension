import React from 'react';

import { TabGroupActions } from '../actions';
import constants from '../constants';

export class TabGroup extends React.Component {

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

    TabGroupActions.wakeGroup(this.props.group);
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
    let { group, className, ...attrs } = this.props;

    let title = `${this.state.tabs.length} Tab${pluralization}`;

    return <div {...attrs} className={`tab-group ${className || ''}`}>
      <div className='tab-group--title-action-container'>
        <span className='tab-group--title'>
          {this.state.tabs.length} Tab{pluralization}
        </span>

        <ul className='tab-group--actions'>
          <li><a onClick={this.onWakeClicked.bind(this)}>Wake</a></li>
          <li><a onClick={this.onRenameClicked.bind(this)}>Rename</a></li>
          <li><a onClick={this.onDeleteClicked.bind(this)}>Delete</a></li>
        </ul>
      </div>

      <ul className='tab-group--urls'>
        {this.state.tabs
          .map(t => <li key={t.id}><a href={t.url}>{t.title}</a></li>)}
      </ul>
    </div>;
  }
}

export default TabGroup;
