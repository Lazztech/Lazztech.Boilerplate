import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { ShareableId } from './shareableId.entity';

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
}
