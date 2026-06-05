import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  Controller,
  Get,
  Header,
  Logger,
  Param,
  Post,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../../auth/auth.guard';
import { Payload } from '../../auth/dto/payload.dto';
import { User } from '../../auth/user.decorator';
import { User as UserEntity } from '../../dal/entity/user.entity';
import { FileService } from '../file-service.abstract';
import { ConditionalAuthGuard } from '../../auth/conditional-auth.guard';

@Controller('file')
export class FileController {
  private logger = new Logger(FileController.name);

  constructor(
    private readonly fileService: FileService,
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>,
  ) {}

  @UseGuards(ConditionalAuthGuard)
  @Get('files')
  @Render('files')
  async getFiles(@User() payload: Payload) {
    const user = await this.userRepository.findOne(
      { id: payload.userId },
      { populate: ['fileUploads'] },
    );
    return {
      files: user?.fileUploads,
    };
  }

  @UseGuards(AuthGuard)
  @Post('upload')
  @Render('files')
  async uploadFile(@User() payload: Payload, @Req() req: FastifyRequest) {
    const data = await req.file();
    await this.fileService.storeImageFromFileUpload(data, payload.userId);
    const user = await this.userRepository.findOne(
      { id: payload.userId },
      { populate: ['fileUploads'] },
    );
    return {
      files: user?.fileUploads,
    };
  }

  @Get(':fileName')
  @Header('Cache-Control', 'public, max-age=31536000, immutable') // public for CDN, max-age= 1 year for immutable content
  async getFile(@Param('fileName') fileName: string) {
    return this.fileService.get(fileName);
  }

  @Get('watermark/:shareableId')
  @Header('Cache-Control', 'public, max-age=86400') // public for CDN, max-age= 24hrs in seconds
  @Header('content-type', 'image/jpeg')
  async watermark(@Param('shareableId') shareableId: string) {
    const fileStream = await this.fileService.getByShareableId(shareableId);
    return this.fileService.watermarkImage(fileStream);
  }
}
