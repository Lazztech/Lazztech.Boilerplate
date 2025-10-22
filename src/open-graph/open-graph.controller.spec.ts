import { Test, TestingModule } from '@nestjs/testing';
import { FileUrlService } from '../file/file-url/file-url.service';
import { OpenGraphController } from './open-graph.controller';
import { OpenGraphService } from './open-graph.service';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { File } from '../dal/entity/file.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';

describe('OpenGraphController', () => {
  let controller: OpenGraphController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenGraphController],
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

    controller = module.get<OpenGraphController>(OpenGraphController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
