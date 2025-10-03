import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Setup MVC https://docs.nestjs.com/techniques/mvc
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));

  /** Serve htmx from node_modules
   * https://htmx.org/docs/#installing
   * https://blog.wesleyac.com/posts/why-not-javascript-cdn */
  app.useStaticAssets(join(__dirname, '..', 'node_modules/htmx.org/dist'), {
    prefix: '/htmx/',
  });
  app.useStaticAssets(join(__dirname, '..', 'node_modules/htmx-ext-sse/'), {
    prefix: '/htmx/',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
