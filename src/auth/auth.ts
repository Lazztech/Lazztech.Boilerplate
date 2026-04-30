import { betterAuth } from 'better-auth';
import { kyselyAdapter } from '@better-auth/kysely-adapter';
import { Kysely, SqliteDialect, PostgresDialect } from 'kysely';
import Database from 'better-sqlite3';
import { Pool } from 'pg';
import * as nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';

function createDb() {
  const dbType = process.env.DATABASE_TYPE ?? 'sqlite';
  if (dbType === 'postgres') {
    const pool = new Pool({
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number(process.env.DATABASE_PORT ?? 5432),
      database: process.env.DATABASE_SCHEMA ?? 'postgres',
      user: process.env.DATABASE_USER ?? 'postgres',
      password: process.env.DATABASE_PASS ?? 'postgres',
      ssl: process.env.DATABASE_SSL
        ? { rejectUnauthorized: false }
        : undefined,
    });
    return {
      db: new Kysely({ dialect: new PostgresDialect({ pool }) }),
      type: 'postgres' as const,
    };
  }
  const sqlite = new Database(
    process.env.DATABASE_SCHEMA ?? './data/sqlite3.db',
  );
  return {
    db: new Kysely({ dialect: new SqliteDialect({ database: sqlite }) }),
    type: 'sqlite' as const,
  };
}

function createTransporter() {
  if (process.env.EMAIL_TRANSPORT === 'mailgun') {
    return nodemailer.createTransport(
      mg({
        auth: {
          api_key: process.env.EMAIL_API_KEY ?? '',
          domain: process.env.EMAIL_DOMAIN ?? '',
        },
      }),
    );
  }
  if (process.env.EMAIL_TRANSPORT === 'gmail') {
    return nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_FROM_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return null;
}

const { db, type: dbType } = createDb();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  database: kyselyAdapter(db, { type: dbType }),
  user: {
    modelName: 'user',
    fields: {
      name: 'name',
      emailVerified: 'email_verified',
      image: 'image',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60, // cache for 1 hour; still validated against DB on expiry
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const transporter = createTransporter();
      if (!transporter) return;
      await transporter.sendMail({
        from: process.env.EMAIL_FROM_ADDRESS,
        to: user.email,
        subject: `Password reset for ${user.email}`,
        text: `Hello ${user.email}, click this link to reset your password: ${url}`,
        html: `<p>Hello <strong>${user.email}</strong>, <a href="${url}">click here to reset your password</a>.</p>`,
      });
    },
  },
});
