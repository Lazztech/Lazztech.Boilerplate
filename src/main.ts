import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCompress from '@fastify/compress';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import hbs from 'hbs';
import type { HelperOptions } from 'handlebars';
import { join } from 'path';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const adapter = new FastifyAdapter({ trustProxy: true });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      bufferLogs: true,
    },
  );
  app.useLogger(app.get(Logger));

  await app.register(fastifyCookie);
  await app.register(fastifyCompress);
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB
      files: 5,
    },
  });

  await app.register(fastifyStatic, {
    root: join(__dirname, '..', 'public'),
    decorateReply: false,
  });

  await app.register(fastifyStatic, {
    root: [
      join(__dirname, '..', 'node_modules/htmx.org/dist'),
      join(__dirname, '..', 'node_modules/htmx-ext-sse/'),
      join(__dirname, '..', 'node_modules/hyperscript.org/dist'),
      join(__dirname, '..', 'node_modules/@khmyznikov/pwa-install/dist'),
      join(__dirname, '..', 'node_modules/workbox-window/build'),
    ],
    prefix: '/modules/',
    decorateReply: false,
  });

  await app.register(fastifyStatic, {
    root: join(__dirname, '..', 'node_modules/pulltorefreshjs/dist'),
    prefix: '/modules/pulltorefresh',
    decorateReply: false,
  });

  await app.register(fastifyView, {
    engine: { handlebars: hbs },
    root: join(__dirname, '..', 'views'),
    viewExt: 'hbs',
    layout: 'layout',
    includeViewExtension: true,
    options: {
      partials: {
        dock: 'partials/dock.hbs',
        navbar: 'partials/navbar.hbs',
      },
    },
  });

  // Register handlebars helpers after engine setup
  hbs.registerHelper(
    'filterErrors',
    function (
      errors: { property: string; constraints?: Record<string, string> }[],
      property: string,
    ) {
      if (!errors || !Array.isArray(errors)) {
        return;
      }
      return errors
        .filter((error) => error.property === property)
        .flatMap((e) => Object.values(e.constraints || {}));
    },
  );
  hbs.registerHelper('json', function (context: unknown) {
    return JSON.stringify(context);
  });
  hbs.registerHelper(
    'ifEquals',
    function (arg1: unknown, arg2: unknown, options: HelperOptions) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    },
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
