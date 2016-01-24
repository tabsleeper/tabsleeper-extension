import React from 'react';

import TabGroup from '../../tab-group';
import Database from '../../database';

import TabGroupComponent from '../tab-group.jsx'

class NewTab extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      groups: []
    }

    this.db = new Database();
    this.db.open();
  }

  componentWillMount() {
    this.refreshGroups();
  }

  componentDidMount() {
    chrome.runtime.onMessage.addListener(this.refreshGroups.bind(this));
  }

  refreshGroups() {
    this.db.groups.toArray((groups) => {
      this.setState({
        groups: groups.map(g => new TabGroup(g))
      })
    });
  }

  render() {
    return <div>
      <h1>Snoozed sessions</h1>

      {this.state.groups.map(g => <TabGroupComponent key={g.uuid} group={g} />)}
    </div>;
  }
}

export default NewTab;
