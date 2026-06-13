import { Injectable } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { FileUrlService } from '../file/file-url/file-url.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { File } from '../dal/entity/file.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { OpenGraphTagValues } from '../dal/entity/shareableId.entity';

@Injectable()
export class OpenGraphService {
  constructor(
    private readonly fileUrlService: FileUrlService,
    @InjectRepository(File)
    private readonly fileRepository: EntityRepository<File>,
    private readonly em: EntityManager,
  ) {}

  public async getShareableTagValues(
    shareableId: string,
    type: string,
    req: FastifyRequest,
  ): Promise<OpenGraphTagValues> {
    if (type == 'file') {
      const file = await this.fileRepository.findOne(
        { shareableId },
        {
          populate: ['createdBy'],
        },
      );
      return file.getOpenGraphTagValues(req);
    }
  }
}
