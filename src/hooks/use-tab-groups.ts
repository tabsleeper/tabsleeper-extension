import { useState, useEffect } from 'react';
import { TabGroup } from '@models';

export default (): [tabGroups: TabGroup[], refreshTabGroups: VoidFunction] => {
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
