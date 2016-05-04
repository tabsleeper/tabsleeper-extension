import React from 'react';

import { WindowService } from '../services';
import { WindowActions } from '../actions';

import Icons from '../icons';

class SleepWindowButton extends React.Component {
  onClick(evt) {
    WindowService.getCurrentWindow().then(win => WindowActions.sleepWindow(win.id));
  }

  render() {
    return <button className='sleep-window-button' onClick={this.onClick.bind(this)}>
      <span>
        <Icons.Sleep color='white' width='18px' height='18px' /> Sleep this Window
      </span>
    </button>;
  }
}

export { SleepWindowButton };
export default SleepWindowButton;
