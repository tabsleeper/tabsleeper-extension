import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { TabGroupActions } from 'actions';
import constants from 'constants';
import { Wake, Edit, Destroy } from 'icons';

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

export default ({ group, className, onDelete, onWake, ...attrs }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(group.name || '');

  const tabs = group.getTabs();

  const onWakeClicked = (evt) => {
    evt.preventDefault();
    TabGroupActions.wakeGroup(group).then(onWake);
  };

  const onDeleteClicked = (evt) => {
    evt.preventDefault();
    group.destroy().then(onDelete);
  };

  const onEditClicked = (evt) => {
    evt.preventDefault();
    setIsEditing(true);
  };

  const onExpandClicked = (evt) => {
    evt.preventDefault();
    setIsExpanded(true);
  };

  const onDraftTitleChanged = (evt) => {
    setDraftTitle(evt.target.value);
  };

  const onCancelEdit = (evt) => {
    evt.preventDefault();
    setIsEditing(false);
    setDraftTitle(group.name);
  }

  const onSaveEdit = (evt) => {
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
              <input type='text' name='title' value={draftTitle} onChange={onDraftTitleChanged} autoFocus />
            </div>
            <div className='input-group'>
              <button type='button' className='btn btn-primary' onClick={onSaveEdit}>Save</button>
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
