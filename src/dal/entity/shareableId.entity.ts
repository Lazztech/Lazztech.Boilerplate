import { BeforeCreate, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

export abstract class ShareableId {
  @Property({ fieldName: 'shareableId' })
  shareableId?: string;

  // Only fires is repostiory.create is used for before save
  @BeforeCreate()
  private addId() {
    this.shareableId = uuid();
  }

  // Indended to be used to indicate that it's been reported
  @Property({ nullable: true })
  public flagged?: boolean;

  @Property({ nullable: true })
  public banned?: boolean;
}
