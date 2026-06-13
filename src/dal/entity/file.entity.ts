import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  type Ref,
  Unique,
} from '@mikro-orm/core';
import { OpenGraphTagValues, ShareableId } from './shareableId.entity';
import { User } from './user.entity';

@Entity()
export class File extends ShareableId {
  @PrimaryKey()
  public id!: number;

  @Unique()
  @Property()
  public fileName!: string;

  @Property({ nullable: true })
  public mimetype?: string;

  @Property()
  public createdOn!: string;

  @ManyToOne({
    entity: () => User,
    deleteRule: 'cascade',
    ref: true,
    nullable: true,
  })
  public createdBy?: Ref<User>;

  public async getOpenGraphTagValues(): Promise<OpenGraphTagValues> {
    const createdBy = await this?.createdBy?.load();
    return {
      ogUrl: `${req.protocol}://${req.host}/file/${shareableId}`,
      ogTitle: file?.fileName,
      ogDescription: `From ${createdBy?.email}`,
      ogImage: this.fileUrlService.getWatermarkedFileUrl(shareableId, req),
      file,
      createdBy,
    } as OpenGraphTagValues;
  }
}
