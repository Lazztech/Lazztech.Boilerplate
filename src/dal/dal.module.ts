import { Connection, IDatabaseDriver } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { MikroOrmModule, MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import postgresMikroOrmConfig from './mikro-orm.postgres.config';
import sqliteMikroOrmConfig from './mikro-orm.sqlite.config';
import path from 'path';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const commonSettings = {
          logger: (message) => console.log(message),
          allowGlobalContext: true,
          debug: configService.get('NODE_ENV') == 'development',
          migrations: {
            pattern: /^.*\.(js|ts)$/, // ends with .js or .ts
            transactional: true,
          },
          extensions: [Migrator],
          autoLoadEntities: true,
        } as MikroOrmModuleOptions<IDatabaseDriver<Connection>>;

        switch (configService.get('DATABASE_TYPE', 'sqlite')) {
          case 'sqlite':
            return {
              ...commonSettings,
              ...sqliteMikroOrmConfig,
              baseDir: __dirname,
              dbName: configService.get(
                'DATABASE_SCHEMA',
                path.join('data', 'sqlite3.db'),
              ),
            } as MikroOrmModuleOptions<IDatabaseDriver<Connection>>;
          case 'postgres':
            return {
              ...commonSettings,
              ...postgresMikroOrmConfig,
              dbName: configService.get('DATABASE_SCHEMA', 'postgres'),
              host: configService.get('DATABASE_HOST', 'localhost'),
              port: configService.get<number>('DATABASE_PORT', 5432),
              user: configService.get('DATABASE_USER', 'postgres'),
              password: configService.get('DATABASE_PASS', 'postgres'),
              driverOptions: {
                connection: {
                  ssl: configService.get('DATABASE_SSL')
                    ? {
                        rejectUnauthorized: false,
                      }
                    : undefined,
                },
              },
            } as MikroOrmModuleOptions<IDatabaseDriver<Connection>>;
          default:
            throw new Error(
              'Invalid database type selected. It must be either sqlite (default) or postgres.',
            );
        }
      },
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
