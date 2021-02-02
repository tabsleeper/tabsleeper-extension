import * as React from 'react';
import { useState } from 'react';
import type {
  ChangeEvent,
  FormEvent,
  FunctionComponent,
  MouseEvent,
  MouseEventHandler
} from 'react';

import { TabGroupActions } from '@actions';
import { Wake, Edit, Destroy } from '@icons';
import type { TabInfo } from '@root/database';
import type { TabGroup as ITabGroup } from '@models';

const SHOW_N_TABS = 3;

function groupTitleText(tabs: TabInfo[]) {
  let pluralization = (tabs.length === 1) ? '' : 's';
  return `${tabs.length} Tab${pluralization}`;
}

function renderTabList(tabs: TabInfo[], expanded: boolean) {
  if (!expanded) tabs = tabs.slice(0, SHOW_N_TABS);

  return tabs.map(t => <li key={t.id}><a href={t.url}>{t.title}</a></li>);
}

function renderExpandAction(tabs: TabInfo[], expanded: boolean, clickHandler: MouseEventHandler) {
  if (!expanded && tabs.length > SHOW_N_TABS) {
    return (<div className='tab-group--expand'>
      <a onClick={clickHandler}>
        +{tabs.slice(SHOW_N_TABS).length} more
      </a>
    </div>);
  }
}

interface Props {
  group: ITabGroup;
  className?: string;
  onDelete: VoidFunction;
  onWake: VoidFunction;
};

const TabGroup: FunctionComponent<Props> = ({ group, className, onDelete, onWake, ...attrs }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draftTitle, setDraftTitle] = useState<string>(group.name || '');

  const tabs = group.getTabs();

  const onWakeClicked = (evt: MouseEvent<HTMLAnchorElement>) => {
    evt.preventDefault();
    TabGroupActions.wakeGroup(group).then(onWake);
  };

  const onDeleteClicked = (evt: MouseEvent<HTMLAnchorElement>) => {
    evt.preventDefault();
    group.destroy().then(onDelete);
  };

  const onEditClicked = (evt: MouseEvent<HTMLAnchorElement>) => {
    evt.preventDefault();
    setIsEditing(true);
  };

  const onExpandClicked = (evt: MouseEvent<HTMLAnchorElement>) => {
    evt.preventDefault();
    setIsExpanded(true);
  };

  const onDraftTitleChanged = (evt: ChangeEvent<HTMLInputElement>) => {
    setDraftTitle(evt.target.value);
  };

  const onCancelEdit = (evt: MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    setIsEditing(false);
    setDraftTitle(group.name);
  }

  const onSaveEdit = (evt: FormEvent) => {
    evt.preventDefault();
    group.name = draftTitle;
    group.save();
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div {...attrs} className={`tab-group ${className || ''}`}>
        <div className='tab-group--title-action-container'>
          <span className='tab-group--title'>Name your tab group</span>
        </div>

        <div className='tab-group--edit-form'>
          <form onSubmit={onSaveEdit}>
            <div className='input-group'>
              <input type='text' name='title' autoComplete="off" value={draftTitle} onChange={onDraftTitleChanged} autoFocus />
            </div>
            <div className='input-group'>
              <input type='submit' className='btn btn-primary' value="Save" />
              <button type='button' className='btn btn-secondary ml-1' onClick={onCancelEdit}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return <div {...attrs} className={`tab-group ${className || ''}`}>
    <div className='tab-group--title-action-container'>
      <span className='tab-group--title'>
        {(group.name) ? `${group.name} (${tabs.length})` : groupTitleText(tabs)}
      </span>

      <ul className='tab-group--actions'>
        <li>
          <a onClick={onWakeClicked}>
            <Wake color='#0C74D5' width='18px' height='18px' />
          </a>
        </li>
        <li>
          <a onClick={onEditClicked}>
            <Edit color='#0C74D5' width='18px' height='18px' />
          </a>
        </li>
        <li>
          <a onClick={onDeleteClicked}>
            <Destroy color='#0C74D5' width='18px' height='18px' />
          </a>
        </li>
      </ul>
    </div>

    <ul className='tab-group--urls'>
      {renderTabList(tabs, isExpanded)}
    </ul>

    {renderExpandAction(tabs, isExpanded, onExpandClicked)}
  </div>;
};

export default TabGroup;
