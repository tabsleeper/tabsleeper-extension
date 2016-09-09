import Dexie from 'dexie';

export class Database extends Dexie {

  static DB_NAME = 'tab-sleeper';

  constructor() {
    super(Database.DB_NAME);

    this.version(1)
      .stores({
        groups: 'uuid' // indexed primary key
      });

    this.version(2)
      .stores({
        groups: 'uuid,createdAt' // indexed primary key
      }).upgrade(tx => {
        // Add a default date - we don't know when original groups were created
        tx.table('groups').toCollection().modify(groups => {
          groups.createdAt = new Date();
          groups.updatedAt = new Date();
        });
      });
  }

}

export default Database;
