import { useState, useEffect } from "react";
import { TabGroup } from "@models";
import { addListener, MessageHandler } from "@messaging";

export default (): [tabGroups: TabGroup[], refreshTabGroups: VoidFunction] => {
  const [tabGroups, setTabGroups] = useState([]);

  const refreshTabGroups = () => {
    TabGroup.all().then(setTabGroups);

    return false;
  };

  useEffect(() => {
    refreshTabGroups();

    return addListener(refreshTabGroups);
  }, []);

  return [tabGroups, refreshTabGroups];
};
