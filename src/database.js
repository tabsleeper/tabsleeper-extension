import Dexie from 'dexie';

class Database extends Dexie {

  static DB_NAME = 'tab-sleeper';

  constructor() {
    super(Database.DB_NAME);

    this.version(1)
      .stores({
        groups: 'uuid' // indexed primary key
      });
  }

}

export default Database;
