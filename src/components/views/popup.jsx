import React from 'react';
import PropTypes from 'prop-types';

import { DataActions } from 'actions';
import useTabGroups from 'hooks/use-tab-groups';
import useSelectedTabCount from 'hooks/use-selected-tab-count';

import TabGroupComponent from 'components/tab-group.jsx';
import SleepWindowButton from 'components/sleep-window-button.jsx';

export default () => {
  const [tabGroups, refreshTabGroups] = useTabGroups();
  const [selectedTabs] = useSelectedTabCount();

  const openManageData = (evt) => {
    evt.preventDefault();

    browser.tabs.create({ url: "/static/manage-data.html" });
  }

  return (
    <div className='popup'>
      <div className='primary-action'>
        <SleepWindowButton selectedCount={selectedTabs} />
      </div>
      <div className='popup--tab-groups'>
        <ul>
          <li>
            <a className="export-link" href="#" onClick={openManageData}>Manage tab data</a>
          </li>
          {tabGroups.map(g => {
            return (
              <li key={g.uuid}>
                <TabGroupComponent
                  group={g}
                  onDelete={refreshTabGroups}
                  onWake={refreshTabGroups} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
