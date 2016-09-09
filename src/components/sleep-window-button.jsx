import React from 'react';

import { TabService, WindowService } from '../services';
import { TabActions, WindowActions } from '../actions';

import Icons from '../icons';

function buttonText(count) {
  if (count > 2) {
    return `Sleep ${count} Selected Tabs`;
  } else {
    return "Sleep this Window";
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
        <Icons.Sleep color='white' width='18px' height='18px' /> {buttonText(this.props.selectedCount)}
      </span>
    </button>;
  }
}

SleepWindowButton.propTypes = {
  selectedCount: React.PropTypes.number.isRequired
};

export { SleepWindowButton };
export default SleepWindowButton;
