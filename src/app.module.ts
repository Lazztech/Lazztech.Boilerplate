import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { MikroOrmModule, MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { Connection, IDatabaseDriver } from '@mikro-orm/core';
import * as path from 'path';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      validationSchema: Joi.object({
        APP_NAME: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const commonSettings = {
          logger: (message) => console.log(message),
          allowGlobalContext: true,
          debug: configService.get('NODE_ENV') == 'development' ? true : false,
          migrations: {
            pattern: /^.*\.(js|ts)$/, // ends with .js or .ts
            transactional: true,
            disableForeignKeys: false,
          },
          entities: [__dirname + '/dal/entity/**/*.*.*'],
        } as MikroOrmModuleOptions<IDatabaseDriver<Connection>>;
        switch (configService.get('DATABASE_TYPE', 'sqlite')) {
          case 'sqlite':
            AppModule.logger.log(
              `Using sqlite db: ${path.join(
                process.cwd(),
                configService.get(
                  'DATABASE_SCHEMA',
                  path.join('data', 'sqlite3.db'),
                ),
              )}`,
            );
            return {
              ...commonSettings,
              migrations: {
                ...commonSettings.migrations,
                path: __dirname + '/dal/migrations/sqlite/',
              },
              driver: SqliteDriver,
              baseDir: __dirname,
              dbName: configService.get(
                'DATABASE_SCHEMA',
                path.join('data', 'sqlite3.db'),
              ),
            } as MikroOrmModuleOptions<IDatabaseDriver<Connection>>;
          case 'postgres':
            AppModule.logger.log(
              `Using postgres db: ${configService.get(
                'DATABASE_SCHEMA',
                'postgres',
              )}, host: ${configService.get('DATABASE_HOST', 'localhost')}`,
            );
            return {
              ...commonSettings,
              migrations: {
                ...commonSettings.migrations,
                path: __dirname + '/dal/migrations/postgres/',
              },
              driver: PostgreSqlDriver,
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  public static logger = new Logger(AppModule.name);
}
