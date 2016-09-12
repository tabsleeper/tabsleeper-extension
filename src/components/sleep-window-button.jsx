import React from 'react';

import { TabService, WindowService } from '../services';
import { TabActions, WindowActions } from '../actions';

function buttonText(count) {
  if (count > 2) {
    return `Sleep ${count} Selected Tabs`;
  } else {
    return "Sleep this window";
  }
}

class SleepWindowButton extends React.Component {
  onClick(evt) {
    if (this.props.selectedCount >= 2) {
      WindowService.getCurrentWindow().
        then(win => TabService.getSelectedTabs(win.id)).
        then(TabActions.sleepTabs);
    } else {
      WindowService.getCurrentWindow().then(win => WindowActions.sleepWindow(win.id));
    }
  }

  render() {
    return <button className='sleep-window-button' onClick={this.onClick.bind(this)}>
      <span>
        {buttonText(this.props.selectedCount)}
      </span>
    </button>;
  }
}

SleepWindowButton.propTypes = {
  selectedCount: React.PropTypes.number.isRequired
};

export { SleepWindowButton };
export default SleepWindowButton;
