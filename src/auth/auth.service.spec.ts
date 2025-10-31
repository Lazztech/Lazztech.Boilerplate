import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { User } from '../dal/entity/user.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { JwtModule } from '@nestjs/jwt';
import { PasswordReset } from '../dal/entity/passwordReset.entity';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'dummyaccesstoken',
        }),
      ],
      providers: [
        AuthService,
        ConfigService,
        EmailService,
        {
          provide: getRepositoryToken(User),
          useClass: EntityRepository,
        },
        {
          provide: getRepositoryToken(PasswordReset),
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
