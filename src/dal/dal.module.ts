import { Connection, IDatabaseDriver } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { MikroOrmModule, MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import path from 'path';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        switch (configService.get('DATABASE_TYPE', 'sqlite')) {
          case 'sqlite':
            return {
              name: 'sqlite',
              driver: SqliteDriver,
              baseDir: process.cwd(),
              dbName: configService.get(
                'DATABASE_SCHEMA',
                path.join('data', 'sqlite3.db'),
              ),
              entities: ['./dist/dal/entity'],
              entitiesTs: ['./src/dal/entity'],
              extensions: [Migrator],
              migrations: {
                pattern: /^.*\.(js|ts)$/, // ends with .js or .ts
                path: './src/dal/migrations/sqlite',
                pathTs: './dist/dal/migrations/sqlite',
                transactional: true,
              },
              logger: (message) => console.log(message),
              allowGlobalContext: true,
              debug: configService.get('NODE_ENV') == 'development',
            } as MikroOrmModuleOptions<IDatabaseDriver<Connection>>;
          case 'postgres':
            return {
              name: 'postgres',
              driver: PostgreSqlDriver,
              dbName: configService.get('DATABASE_SCHEMA', 'postgres'),
              host: configService.get('DATABASE_HOST', 'localhost'),
              port: configService.get<number>('DATABASE_PORT', 5432),
              user: configService.get('DATABASE_USER', 'postgres'),
              password: configService.get('DATABASE_PASS', 'postgres'),
              entities: ['./dist/dal/entity'],
              entitiesTs: ['./src/dal/entity'],
              extensions: [Migrator],
              migrations: {
                pattern: /^.*\.(js|ts)$/, // ends with .js or .ts
                path: './src/dal/migrations/postgres',
                pathTs: './dist/dal/migrations/postgres',
                transactional: true,
              },
              driverOptions: {
                connection: {
                  ssl: configService.get('DATABASE_SSL')
                    ? {
                        rejectUnauthorized: false,
                      }
                    : undefined,
                },
              },
              logger: (message) => console.log(message),
              allowGlobalContext: true,
              debug: configService.get('NODE_ENV') == 'development',
            } as MikroOrmModuleOptions<IDatabaseDriver<Connection>>;
          default:
            throw new Error(
              'Invalid database type selected. It must be either sqlite (default) or postgres.',
            );
        }
      },
      // "feat: add driver option to get around issues with useFactory and inject #204"
      // https://github.com/mikro-orm/nestjs/pull/204
      driver:
        process.env.DATABASE_TYPE == 'sqlite' ? SqliteDriver : PostgreSqlDriver,
    }),
  ],
})
export class DalModule {
  private logger = new Logger(DalModule.name);

  constructor(private configService: ConfigService) {
    switch (configService.get('DATABASE_TYPE', 'sqlite')) {
      case 'sqlite':
        this.logger.log(
          `Using sqlite db: ${path.join(
            process.cwd(),
            configService.get(
              'DATABASE_SCHEMA',
              path.join('data', 'sqlite3.db'),
            ),
          )}`,
        );
        break;
      case 'postgres':
        this.logger.log(
          `Using postgres db: ${this.configService.get(
            'DATABASE_SCHEMA',
            'postgres',
          )}, host: ${configService.get('DATABASE_HOST', 'localhost')}`,
        );
        break;
    }
  }
}
