import React from 'react';

import { TabGroup } from '../../models';
import Database from '../../database';

import { TabGroup as TabGroupComponent } from '../tab-group.jsx';
import SleepWindowButton from '../sleep-window-button.jsx';

export class Popup extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      tabGroups: [],
      topSites: []
    }

    this.db = new Database();
    this.db.open();
  }

  /**
   * Fetch the initial data
   */
  componentWillMount() {
    this.refreshTabGroups();
  }

  /**
   * Set up a listener so the page will update when changes are broadcast
   */
  componentDidMount() {
    chrome.runtime.onMessage.addListener(this.refreshTabGroups.bind(this));

    chrome.topSites.get((topSites) => {
      topSites = topSites.splice(0,4);
      this.setState({ topSites });
    });
  }

  /**
   * Fetch tabGroups from storage and update component state
   */
  refreshTabGroups() {
    this.db.groups.orderBy('createdAt').reverse().toArray((tabGroups) => {
      tabGroups = tabGroups.map(g => new TabGroup(g));

      this.setState({ tabGroups })
    });
  }

  render() {
    return <div className='popup'>
      <SleepWindowButton />
      <ul className='popup--tab-groups'>
        {this.state.tabGroups.map(g => {
          return <li key={g.uuid}><TabGroupComponent group={g} /></li>;
        })}
      </ul>
    </div>;
  }
}

export default Popup;
