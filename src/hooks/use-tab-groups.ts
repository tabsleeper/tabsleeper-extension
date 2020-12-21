import { useState, useEffect } from 'react';
import { TabGroup } from '@models';

export default () => {
  const [tabGroups, setTabGroups] = useState([]);

  const refreshTabGroups = () => {
    TabGroup.all().then(setTabGroups);
  }

  useEffect(() => {
    browser.runtime.onMessage.addListener(refreshTabGroups);

    refreshTabGroups();

    return () => {
      browser.runtime.onMessage.removeListener(refreshTabGroups);
    };
  }, []);

  return [tabGroups, refreshTabGroups];
};
