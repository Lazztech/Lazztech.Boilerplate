import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectS3, type S3 } from 'nestjs-s3';
import { FileServiceInterface } from '../interfaces/file-service.interface';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { FileUpload } from '../interfaces/file-upload.interface';
import sharp from 'sharp';
import { InjectRepository } from '@mikro-orm/nestjs';
import { File } from '../../dal/entity/file.entity';
import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/core';
import Stream, { Readable } from 'stream';

@Injectable()
export class S3FileService implements FileServiceInterface {
  private logger = new Logger(S3FileService.name);
  private bucketName: string;

  constructor(
    @InjectS3() private readonly s3: S3,
    readonly configService: ConfigService,
    @InjectRepository(File)
    private readonly fileRepository: EntityRepository<File>,
    private readonly em: EntityManager,
  ) {
    this.bucketName = configService.get('OBJECT_STORAGE_BUCKET_NAME') as string;
  }

  public async storeImageFromFileUpload(
    upload: Promise<FileUpload> | FileUpload,
    userId: any,
  ): Promise<File> {
    const { createReadStream, mimetype } = await upload;
    console.log(upload);
    if (!mimetype?.startsWith('image/')) {
      throw new HttpException('Wrong filetype', HttpStatus.BAD_REQUEST);
    }

    const fileName = randomUUID() + '.webp';
    const transformer = sharp()
      .webp({ quality: 100 })
      .resize(1080, 1080, { fit: sharp.fit.inside });

    const uploadStream = this.uploadStream(fileName);

    createReadStream()
      .pipe(transformer)
      .pipe(uploadStream.writeStream)
      .on('error', () => {
        new HttpException('Could not save image', HttpStatus.BAD_REQUEST);
      });

    const file = this.fileRepository.create({
      fileName,
      createdOn: new Date().toISOString(),
      createdBy: userId,
    });
    await this.em.persistAndFlush(file);
    return file;
  }

  private uploadStream(key: string) {
    const pass = new Stream.PassThrough();
    return {
      writeStream: pass,
      promise: this.s3.putObject({
        Bucket: this.bucketName,
        Key: key,
        Body: pass,
      }),
    };
  }

  public async delete(url: string): Promise<void> {
    this.logger.debug(this.delete.name);
    const splitUrl = url.split('/');
    const objectName = splitUrl[splitUrl.length - 1];
    await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: objectName,
    });
    this.logger.debug(`Deleted image by url ${url}`);
  }

  public async deleteById(fileId: any, userId: any): Promise<any> {
    const file = await this.fileRepository.findOneOrFail({
      id: fileId,
      createdBy: userId,
    });
    await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: file.fileName,
    });
    return this.fileRepository.getEntityManager().removeAndFlush(file);
  }

  async get(fileName: string): Promise<Readable | undefined> {
    const result = await this.s3.getObject({
      Bucket: this.bucketName,
      Key: fileName,
    });
    return result.Body as Readable;
  }

  async getByShareableId(shareableId: string): Promise<Readable | undefined> {
    const file = await this.fileRepository.findOneOrFail({ shareableId });
    const result = await this.s3.getObject({
      Bucket: this.bucketName,
      Key: file.fileName,
    });
    return result.Body as Readable;
  }
}
