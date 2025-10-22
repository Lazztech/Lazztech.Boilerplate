import { Test, TestingModule } from '@nestjs/testing';
import { FileUrlService } from '../file/file-url/file-url.service';
import { OpenGraphService } from './open-graph.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';

describe('OpenGraphService', () => {
  let service: OpenGraphService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenGraphService,
        FileUrlService,
        {
          provide: getRepositoryToken(File),
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

    service = module.get<OpenGraphService>(OpenGraphService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
