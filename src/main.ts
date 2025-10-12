import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import hbs from 'hbs';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationError } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Setup MVC https://docs.nestjs.com/techniques/mvc
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.set('view cache', process.env.NODE_ENV === 'production');
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));
  hbs.registerHelper(
    'filterErrors',
    function (errors: ValidationError[], property) {
      return errors
        ?.filter((error) => error.property === property)
        .flatMap((e) => Object.values(e.constraints || {}));
    },
  );
  hbs.registerHelper('json', function (context) {
    return JSON.stringify(context);
  });

  /** Serve htmx from node_modules
   * https://htmx.org/docs/#installing
   * https://blog.wesleyac.com/posts/why-not-javascript-cdn */
  app.useStaticAssets(join(__dirname, '..', 'node_modules/htmx.org/dist'), {
    prefix: '/htmx/',
  });
  app.useStaticAssets(join(__dirname, '..', 'node_modules/htmx-ext-sse/'), {
    prefix: '/htmx/',
  });

  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
