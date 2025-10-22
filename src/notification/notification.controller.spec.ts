import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { User } from '../dal/entity/user.entity';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from './notification.service';
import { UserDevice } from '../dal/entity/userDevice.entity';

describe('NotificationController', () => {
  let controller: NotificationController;

  const DUMMY_VAPID_KEYS = {
    publicKey:
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
    privateKey: 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'SITE_URL':
                  return 'https://mysite.com';
                case 'PUBLIC_VAPID_KEY':
                  return DUMMY_VAPID_KEYS.publicKey;
                case 'PRIVATE_VAPID_KEY':
                  return DUMMY_VAPID_KEYS.privateKey;
                default:
                  return '';
              }
            }),
          },
        },
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: EntityRepository,
        },
        {
          provide: getRepositoryToken(UserDevice),
          useClass: EntityRepository,
        },
        {
          provide: EntityManager,
          useValue: {
            query: jest.fn(),
            // you can mock other functions inside
            // the entity manager object, my case only needed query method
          },
        },
        NotificationService,
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
