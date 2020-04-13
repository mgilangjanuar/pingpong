import { JsonDB } from 'node-json-db'
import { Config } from 'node-json-db/dist/lib/JsonDBConfig'

export class DB {
  private static client: DB
  private database: JsonDB

  private constructor(database: JsonDB) {
    this.database = database
  }

  public static init() {
    if (!DB.client) {
      DB.client = new DB(new JsonDB(new Config('pingpong', true, false, '/')))
    }
    return DB.client
  }

  public static get service() {
    return DB.client.database
  }
}