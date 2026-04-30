import { Migration } from '@mikro-orm/migrations';

export class Migration20260429000000 extends Migration {
  override async up(): Promise<void> {
    // Disable FK checks for table recreation
    this.addSql(`pragma foreign_keys = off;`);

    // 1. Recreate user table: TEXT PK, nullable password, new better-auth cols
    this.addSql(`create table \`user__temp_alter\` (
      \`id\` text not null primary key,
      \`shareable_id\` text not null,
      \`flagged\` integer null,
      \`banned\` integer null,
      \`first_name\` text null,
      \`last_name\` text null,
      \`email\` text null,
      \`password\` text null,
      \`name\` text null,
      \`email_verified\` integer not null default 0,
      \`created_at\` text null,
      \`updated_at\` text null,
      \`image\` text null
    );`);
    this.addSql(
      `insert into \`user__temp_alter\` select CAST(\`id\` as TEXT), \`shareable_id\`, \`flagged\`, \`banned\`, \`first_name\`, \`last_name\`, \`email\`, \`password\`, NULL, 0, datetime('now'), datetime('now'), NULL from \`user\`;`,
    );
    this.addSql(`drop table \`user\`;`);
    this.addSql(`alter table \`user__temp_alter\` rename to \`user\`;`);
    this.addSql(
      `create unique index \`user_email_unique\` on \`user\` (\`email\`);`,
    );

    // 2. Recreate file table with TEXT FK
    this.addSql(`create table \`file__temp_alter\` (
      \`id\` integer not null primary key autoincrement,
      \`shareable_id\` text not null,
      \`flagged\` integer null,
      \`banned\` integer null,
      \`file_name\` text not null,
      \`mimetype\` text null,
      \`created_on\` text not null,
      \`created_by_id\` text null,
      constraint \`file_created_by_id_foreign\` foreign key(\`created_by_id\`) references \`user\`(\`id\`) on delete cascade on update cascade
    );`);
    this.addSql(
      `insert into \`file__temp_alter\` select \`id\`, \`shareable_id\`, \`flagged\`, \`banned\`, \`file_name\`, \`mimetype\`, \`created_on\`, CAST(\`created_by_id\` as TEXT) from \`file\`;`,
    );
    this.addSql(`drop table \`file\`;`);
    this.addSql(`alter table \`file__temp_alter\` rename to \`file\`;`);
    this.addSql(
      `create unique index \`file_file_name_unique\` on \`file\` (\`file_name\`);`,
    );
    this.addSql(
      `create index \`file_created_by_id_index\` on \`file\` (\`created_by_id\`);`,
    );

    // 3. Recreate user_device table with TEXT FK
    this.addSql(`create table \`user_device__temp_alter\` (
      \`id\` integer not null primary key autoincrement,
      \`user_agent\` text null,
      \`push_endpoint\` text not null,
      \`web_push_subscription\` json null,
      \`user_id\` text not null,
      constraint \`user_device_user_id_foreign\` foreign key(\`user_id\`) references \`user\`(\`id\`) on delete cascade on update cascade
    );`);
    this.addSql(
      `insert into \`user_device__temp_alter\` select \`id\`, \`user_agent\`, \`push_endpoint\`, \`web_push_subscription\`, CAST(\`user_id\` as TEXT) from \`user_device\`;`,
    );
    this.addSql(`drop table \`user_device\`;`);
    this.addSql(
      `alter table \`user_device__temp_alter\` rename to \`user_device\`;`,
    );
    this.addSql(
      `create unique index \`user_device_push_endpoint_unique\` on \`user_device\` (\`push_endpoint\`);`,
    );
    this.addSql(
      `create index \`user_device_user_id_index\` on \`user_device\` (\`user_id\`);`,
    );

    // 4. Drop password_reset table (replaced by better-auth verification table)
    this.addSql(`drop table if exists \`password_reset\`;`);

    // 5. Create better-auth session table (camelCase columns = better-auth default)
    this.addSql(`create table \`session\` (
      \`id\` text not null primary key,
      \`expiresAt\` text not null,
      \`token\` text not null,
      \`createdAt\` text not null,
      \`updatedAt\` text not null,
      \`ipAddress\` text null,
      \`userAgent\` text null,
      \`userId\` text not null,
      constraint \`session_userId_foreign\` foreign key(\`userId\`) references \`user\`(\`id\`) on delete cascade on update cascade
    );`);
    this.addSql(
      `create unique index \`session_token_unique\` on \`session\` (\`token\`);`,
    );
    this.addSql(
      `create index \`session_userId_index\` on \`session\` (\`userId\`);`,
    );

    // 6. Create better-auth account table
    this.addSql(`create table \`account\` (
      \`id\` text not null primary key,
      \`accountId\` text not null,
      \`providerId\` text not null,
      \`userId\` text not null,
      \`accessToken\` text null,
      \`refreshToken\` text null,
      \`idToken\` text null,
      \`accessTokenExpiresAt\` text null,
      \`refreshTokenExpiresAt\` text null,
      \`scope\` text null,
      \`password\` text null,
      \`createdAt\` text not null,
      \`updatedAt\` text not null,
      constraint \`account_userId_foreign\` foreign key(\`userId\`) references \`user\`(\`id\`) on delete cascade on update cascade
    );`);
    this.addSql(
      `create index \`account_userId_index\` on \`account\` (\`userId\`);`,
    );

    // 7. Create better-auth verification table
    this.addSql(`create table \`verification\` (
      \`id\` text not null primary key,
      \`identifier\` text not null,
      \`value\` text not null,
      \`expiresAt\` text not null,
      \`createdAt\` text not null,
      \`updatedAt\` text not null
    );`);
    this.addSql(
      `create index \`verification_identifier_index\` on \`verification\` (\`identifier\`);`,
    );

    // 8. Data migration: copy existing password hashes into account table
    //    Each existing user gets a 'credential' account row so they can still log in
    this.addSql(`insert into \`account\` (
      \`id\`, \`accountId\`, \`providerId\`, \`userId\`, \`password\`, \`createdAt\`, \`updatedAt\`
    )
    select
      lower(hex(randomblob(4))) || lower(hex(randomblob(4))) || lower(hex(randomblob(4))) || lower(hex(randomblob(4))),
      \`id\`,
      'credential',
      \`id\`,
      \`password\`,
      datetime('now'),
      datetime('now')
    from \`user\`
    where \`password\` is not null and \`password\` != '';`);

    this.addSql(`pragma foreign_keys = on;`);
  }
}
