import React from 'react';
import PropTypes from 'prop-types';

import { DataActions } from 'actions';
import { TabService, WindowService } from 'services';
import { TabGroup } from 'models';

import TabGroupComponent from 'components/tab-group.jsx';
import SleepWindowButton from 'components/sleep-window-button.jsx';

class Index extends React.Component {
  static propTypes = {
    router: PropTypes.object.isRequired,
  }

  state = {
    selectedTabs: 1,
    tabGroups: [],
  }

  constructor(props) {
    super(props)

    this.exportData = this.exportData.bind(this);
    this.refreshTabGroups = this.refreshTabGroups.bind(this);
    this.updateSelectedCount = this.updateSelectedCount.bind(this);
  }

  /**
   * Fetch the initial data and attach our nav related event listener
   */
  componentWillMount() {
    this.updateSelectedCount();
    this.refreshTabGroups();
  }

  /**
   * Set up a listener so the page will update when changes are broadcast
   */
  componentDidMount() {
    browser.runtime.onMessage.addListener(this.refreshTabGroups);
    browser.tabs.onHighlighted.addListener(this.updateSelectedCount);
  }

  /**
   * Clean up the event listeners so we don't try and update an unmounted
   * component
   */
  componentWillUnmount() {
    browser.runtime.onMessage.removeListener(this.refreshTabGroups);
    browser.tabs.onHighlighted.removeListener(this.updateSelectedCount);
  }

  exportData(evt) {
    evt.preventDefault();

    DataActions.exportJson().then(json => {
      const blob = new Blob([json]);

      const link = window.document.createElement("a");
      link.href = window.URL.createObjectURL(blob, { type: "text/plain" });
      link.download = "tabgroups.tabsleeperbackup";
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    });
  }

  /**
   * Fetch tabGroups from storage and update component state
   */
  refreshTabGroups() {
    TabGroup.all().then(tabGroups => this.setState({ tabGroups }));
  }

  /**
   * Updates the selected tab count to display on the sleep button
   */
  updateSelectedCount() {
    WindowService.getCurrentWindow()
      .then(win => TabService.getSelectedTabs(win.id))
      .then(tabs => this.setState({ selectedTabs: tabs.length }));
  }

  render() {
    return <div className='popup'>
      <SleepWindowButton selectedCount={this.state.selectedTabs} />
      <ul className='popup--tab-groups'>
        {this.state.tabGroups.map(g => {
          return (
            <li key={g.uuid}>
              <TabGroupComponent
                group={g}
                router={this.props.router}
                onDelete={this.refreshTabGroups}
                onWake={this.refreshTabGroups} />
            </li>
          );
        })}
        <li>
          <a className="export-link" href="#" onClick={this.exportData}>Export Tab Data</a>
        </li>
      </ul>
    </div>;
  }
}

export default Index;
