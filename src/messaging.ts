import { TabGroup } from "@models";

export enum Type {
  CHANGE = "CHANGE",
  WAKE_GROUP = "WAKE_GROUP",
}

interface ChangeMessage {
  type: Type.CHANGE;
}

interface WakeGroupMessage {
   type: Type.WAKE_GROUP;
   groupId: TabGroup["uuid"];
 }

export type Message =
  | ChangeMessage
  | WakeGroupMessage;

export type MessageHandler = (message: Message) => void;

/**
 * Send a browser runtime message
 */
export function sendMessage(message: Message): void {
  browser.runtime.sendMessage(message).catch((error) => {
    if (/receiving end does not exist/i.test(error?.message ?? "")) {
      // We're going to run into this problem when a change event is by the
      // background script and no other tabsleeper contexts are open (when the
      // new window takes focus, the popup is dismissed)
      return;
    }

    console.warn(error);
  });
}

/**
 * Subscribe the specified message handler to runtime messages
 * Returns a function which can be used to remove the listener
 */
export function addListener(listenerFn: MessageHandler): VoidFunction {
  browser.runtime.onMessage.addListener(listenerFn);

  return () => {
    browser.runtime.onMessage.removeListener(listenerFn);
  }
}
