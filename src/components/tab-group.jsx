import React from 'react';

import { TabGroupActions } from '../actions';
import constants from '../constants';
import Icon from '../icons';

const SHOW_N_TABS = 3;

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
    this.group.destroy();
  }

  /**
   * Expands the tab group to show all tabs in the card
   */
  onExpandClicked(evt) {
    evt.preventDefault();
    this.setState({ expanded: true });
  }

  render() {
    let pluralization = (this.state.tabs.length === 1) ? '' : 's';
    let { group, className, ...attrs } = this.props;

    let title = `${this.state.tabs.length} Tab${pluralization}`;

    return <div {...attrs} className={`tab-group ${className || ''}`}>
      <div className='tab-group--title-action-container'>
        <span className='tab-group--title'>
          {this.state.tabs.length} Tab{pluralization}
        </span>

        <ul className='tab-group--actions'>
          <li>
            <a onClick={this.onWakeClicked.bind(this)}>
              <Icon.Wake color='#0C74D5' width='18px' height='18px' />
            </a>
          </li>
          <li>
            <a onClick={this.onDeleteClicked.bind(this)}>
              <Icon.Destroy color='#0C74D5' width='18px' height='18px' />
            </a>
          </li>
        </ul>
      </div>

      <ul className='tab-group--urls'>
        {(this.state.expanded)
          ? this.state.tabs.map(t => <li key={t.id}><a href={t.url}>{t.title}</a></li>)
          : this.state.tabs.slice(0,SHOW_N_TABS).
              map(t => <li key={t.id}><a href={t.url}>{t.title}</a></li>)
        }
      </ul>

      {(!this.state.expanded && this.state.tabs.length > SHOW_N_TABS) ?
        <div className='tab-group--expand'>
          <a onClick={this.onExpandClicked.bind(this)}>
            +{this.state.tabs.slice(SHOW_N_TABS).length} more
          </a>
        </div> : null
      }
    </div>;
  }
}

export default TabGroup;
