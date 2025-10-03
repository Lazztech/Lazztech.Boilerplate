import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { join } from 'path';
import hbs from 'hbs';

// https://stackoverflow.com/questions/75817287/jest-encountered-an-unexpected-token-export-default-as-v1-with-uuid
jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => 1),
  };
});

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // https://stackoverflow.com/questions/76710370/nestjs-e2e-testing-error-no-default-engine-specified-and-no-extension-was-provi
    app.useStaticAssets(join(__dirname, '..', 'public'));
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');
    hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => expect(res.text).toContain('Template'));
  });
});
