import * as browser from "webextension-polyfill";
import Dexie from "dexie";

const DB_NAME = "tab-sleeper";

class Database extends Dexie {
  groups: Dexie.Table<IGroup, string>;

  constructor() {
    super(DB_NAME);

    this.version(1).stores({
      groups: "uuid", // indexed primary key
    });

    this.version(2)
      .stores({
        groups: "uuid,createdAt", // indexed primary key
      })
      .upgrade((tx) => {
        // Add a default date - we don't know when original groups were created
        tx.table("groups")
          .toCollection()
          .modify((groups) => {
            groups.createdAt = new Date();
            groups.updatedAt = new Date();
          });
      });

    this.version(3).upgrade((tx) => {
      // Turns out dates need to be serialized manually. Let's obliterate all
      // of those objects that were saved from dates.
      tx.table("groups")
        .toCollection()
        .modify((groups) => {
          groups.createdAt = new Date().toJSON();
          groups.updatedAt = new Date().toJSON();
        });
    });

    this.version(4).stores({
      groups: "uuid,createdAt,updatedAt", // indexed primary key
    });

    this.groups = this.table("groups");
  }
}

export type TabInfo = Pick<
  browser.Tabs.Tab,
  "id" | "url" | "favIconUrl" | "title" | "pinned"
>;

export interface IGroup {
  uuid: string;
  name?: string;
  tabs: TabInfo[];
  createdAt: string;
  updatedAt: string;
}

export default Database;
