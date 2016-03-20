import React from 'react';

import { WindowService } from '../services';
import { WindowActions } from '../actions';

class SleepWindowButton extends React.Component {
  onClick(evt) {
    WindowService.getCurrentWindow().then(win => WindowActions.sleepWindow(win.id));
  }

  render() {
    return <button className='sleep-window-button' onClick={this.onClick.bind(this)}>
      Sleep this Window
    </button>;
  }
}

export { SleepWindowButton };
export default SleepWindowButton;
