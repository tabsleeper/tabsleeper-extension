import React from 'react';

import TabGroup from '../../tab-group';
import Database from '../../database';

import { TabGroup as TabGroupComponent } from '../tab-group.jsx'
import TopSite from '../top-site.jsx';
import Clock from '../clock.jsx';

export class NewTab extends React.Component {

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
    this.db.groups.toArray((tabGroups) => {
      this.setState({
        tabGroups: tabGroups.map(g => new TabGroup(g))
      })
    });
  }

  render() {
    return <div className='new-tab'>
      <div className='new-tab--clock-container'>
        <div className='new-tab--clock-flex' />
        <Clock className='new-tab--clock' />
      </div>

      <ul className='new-tab--top-sites'>
        {this.state.topSites
          .map(s => <li key={s.url}><TopSite url={s.url} title={s.title} /></li>)}
      </ul>

      <ul className='new-tab--tab-groups'>
        {this.state.tabGroups
          .map(g => <li key={g.uuid}><TabGroupComponent group={g} /></li>)}
      </ul>
    </div>;
  }
}

export default NewTab;
