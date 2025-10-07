import { Migration } from '@mikro-orm/migrations';

export class Migration20251007033144 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table \`password_reset\` (\`id\` integer not null primary key autoincrement, \`pin\` text not null);`,
    );

    this.addSql(
      `create table \`user\` (\`id\` integer not null primary key autoincrement, \`shareableId\` text not null, \`flagged\` integer null, \`banned\` integer null, \`firstName\` text null, \`lastName\` text null, \`email\` text null, \`password\` text not null, \`passwordResetId\` integer null, constraint \`user_passwordResetId_foreign\` foreign key(\`passwordResetId\`) references \`password_reset\`(\`id\`) on delete cascade on update cascade);`,
    );
    this.addSql(
      `create unique index \`user_email_unique\` on \`user\` (\`email\`);`,
    );
    this.addSql(
      `create unique index \`user_passwordResetId_unique\` on \`user\` (\`passwordResetId\`);`,
    );

    this.addSql(
      `create table \`file\` (\`id\` integer not null primary key autoincrement, \`shareableId\` text not null, \`flagged\` integer null, \`banned\` integer null, \`file_name\` text not null, \`mimetype\` text null, \`created_on\` text not null, \`createdByUserId\` integer not null, constraint \`file_createdByUserId_foreign\` foreign key(\`createdByUserId\`) references \`user\`(\`id\`) on update cascade);`,
    );
    this.addSql(
      `create unique index \`file_file_name_unique\` on \`file\` (\`file_name\`);`,
    );
    this.addSql(
      `create index \`file_createdByUserId_index\` on \`file\` (\`createdByUserId\`);`,
    );

    this.addSql(
      `create table \`user_device\` (\`id\` integer not null primary key autoincrement, \`web_push_subscription\` json null, \`userId\` integer not null, constraint \`user_device_userId_foreign\` foreign key(\`userId\`) references \`user\`(\`id\`) on delete cascade on update cascade);`,
    );
    this.addSql(
      `create index \`user_device_userId_index\` on \`user_device\` (\`userId\`);`,
    );
  }
}
