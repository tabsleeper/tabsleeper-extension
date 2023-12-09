import { TabService, WindowService } from "@services";
import * as Messaging from "@messaging";
import type { TabGroup } from "@root/models";

/**
 * Creates a new window from the group's tab URLs, and then destroys the group
 */
export function wakeGroup(group: TabGroup): Promise<void> {
  return new Promise((resolve, reject) => {
    Messaging.sendMessage({
      type: Messaging.Type.WAKE_GROUP,
      groupId: group.uuid,
    });

    resolve();
  });
}
