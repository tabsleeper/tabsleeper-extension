import { TabGroup } from 'models';

export default class TabGroupService {
  /**
   * Save a set of tabs into a new TabGroup
   */
  static saveTabs(tabs) {
    return new Promise((resolve, reject) => {
      let group = new TabGroup({ tabs });

      group.save()
        .then(resolve)
        .catch(reject);
    });
  }
}
