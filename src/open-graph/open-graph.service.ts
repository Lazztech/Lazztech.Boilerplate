import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { FileUrlService } from '../file/file-url/file-url.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { File } from '../dal/entity/file.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/core';

export interface OpenGraphTagValues {
  ogUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

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
    req: Request,
  ) {
    if (type == 'file') {
      const file = await this.fileRepository.findOne({ shareableId });
      return {
        ogUrl: `${req.protocol}://${req.get('host')}/file/${shareableId}`,
        ogTitle: file?.fileName,
        ogDescription: '',
        ogImage: file?.fileName
          ? this.fileUrlService.getFileUrl(file?.fileName, req)
          : '',
      };
    }
  }
}
