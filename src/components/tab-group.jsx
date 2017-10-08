import React from 'react';
import PropTypes from 'prop-types';

import { TabGroupActions } from '../actions';
import constants from '../constants';
import Icon from '../icons';

const SHOW_N_TABS = 3;

function groupTitleText(tabs) {
  let pluralization = (tabs.length === 1) ? '' : 's';
  return `${tabs.length} Tab${pluralization}`;
}

function renderTabList(tabs, expanded) {
  if (!expanded) tabs = tabs.slice(0, SHOW_N_TABS);

  return tabs.map(t => <li key={t.id}><a href={t.url}>{t.title}</a></li>);
}

function renderExpandAction(tabs, expanded, clickHandler) {
  if (!expanded && tabs.length > SHOW_N_TABS) {
    return (<div className='tab-group--expand'>
      <a onClick={clickHandler}>
        +{tabs.slice(SHOW_N_TABS).length} more
      </a>
    </div>);
  }
}

export class TabGroup extends React.Component {
  constructor(props) {
    super(props);

    this.group = props.group;

    this.state = {
      tabs: this.group.getTabs()
    };

    this.onWakeClicked   = this.onWakeClicked.bind(this);
    this.onSaveClicked   = this.onSaveClicked.bind(this);
    this.onDeleteClicked = this.onDeleteClicked.bind(this);
    this.onEditClicked = this.onEditClicked.bind(this);
    this.onExpandClicked = this.onExpandClicked.bind(this);
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
    this.group.destroy().then(this.props.onDelete);
  }

  /**
   * Navigate to the edit dialog
   */
  onEditClicked(evt) {
    evt.preventDefault();
    const path = this.props.router.generate('editGroup', { uuid: this.group.uuid });
    window.location.hash = `#${path}`;
  }

  /**
   * Expands the tab group to show all tabs in the card
   */
  onExpandClicked(evt) {
    evt.preventDefault();
    this.setState({ expanded: true });
  }

  render() {
    let { group, className, router, onDelete, ...attrs } = this.props;

    return <div {...attrs} className={`tab-group ${className || ''}`}>
      <div className='tab-group--title-action-container'>
        <span className='tab-group--title'>
          {(group.name) ? `${group.name} (${this.state.tabs.length})` : groupTitleText(this.state.tabs)}
        </span>

        <ul className='tab-group--actions'>
          <li>
            <a onClick={this.onWakeClicked}>
              <Icon.Wake color='#0C74D5' width='18px' height='18px' />
            </a>
          </li>
          <li>
            <a onClick={this.onEditClicked}>
              <Icon.Edit color='#0C74D5' width='18px' height='18px' />
            </a>
          </li>
          <li>
            <a onClick={this.onDeleteClicked}>
              <Icon.Destroy color='#0C74D5' width='18px' height='18px' />
            </a>
          </li>
        </ul>
      </div>

      <ul className='tab-group--urls'>
        {renderTabList(this.state.tabs, this.state.expanded)}
      </ul>

      {renderExpandAction(this.state.tabs, this.state.expanded, this.onExpandClicked)}
    </div>;
  }
}

TabGroup.propTypes = {
  group: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TabGroup;
