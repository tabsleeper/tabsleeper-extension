import React from 'react';
import PropTypes from 'prop-types';

import { TabService, WindowService } from 'services';
import { TabActions, WindowActions } from 'actions';

function buttonText(count) {
  if (count >= 2) {
    return `Sleep ${count} Selected Tabs`;
  } else {
    return "Sleep this window";
  }
}

export default ({ selectedCount }) => {
  const onClick = (evt) => {
    if (selectedCount >= 2) {
      WindowService.getCurrentWindow().
        then(win => TabService.getSelectedTabs(win.id)).
        then(TabActions.sleepTabs);
    } else {
      WindowService.getCurrentWindow().then(win => WindowActions.sleepWindow(win.id));
    }
  }

  return (
    <button className='sleep-window-button' onClick={onClick}>
      <span>
        {buttonText(selectedCount)}
      </span>
    </button>
  );
};
