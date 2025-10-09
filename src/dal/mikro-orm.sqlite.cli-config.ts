import { Options } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { SqliteDriver } from '@mikro-orm/sqlite';

export default {
  name: 'sqlite',
  driver: SqliteDriver,
  extensions: [Migrator],
  dbName: './data/sqlite3.db',
  entities: ['./src/dal/entity/**/*.*.*'],
  entitiesTs: ['./dist/dal/entity/**/*.*.*'],
  migrations: {
    path: './dist/dal/migrations/sqlite',
    pathTs: './src/dal/migrations/sqlite',
    transactional: true,
  },
  debug: true,
} as Options;
