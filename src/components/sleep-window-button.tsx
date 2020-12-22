import React from 'react';
import type { FunctionComponent } from 'react';

import { TabService, WindowService } from '@services';
import { TabActions, WindowActions } from '@actions';

function buttonText(count) {
  if (count >= 2) {
    return `Sleep ${count} Selected Tabs`;
  } else {
    return "Sleep this window";
  }
}

interface Props {
  selectedCount: number;
}

const SleepWindowButton: FunctionComponent<Props> = ({ selectedCount }) => {
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

export default SleepWindowButton;
