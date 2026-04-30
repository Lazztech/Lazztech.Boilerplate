import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { File } from './file.entity';
import { ShareableId } from './shareableId.entity';
import { UserDevice } from './userDevice.entity';

@Entity()
export class User extends ShareableId {
  @PrimaryKey({ type: 'text' })
  public id!: string;

  @Property({ nullable: true })
  public firstName?: string;

  @Property({ nullable: true })
  public lastName?: string;

  @Property({ nullable: true })
  public name?: string;

  @Unique()
  @Property({ nullable: true })
  public email?: string;

  @Property({ nullable: true })
  public password?: string;

  @Property({ columnType: 'integer', default: 0 })
  public emailVerified: boolean = false;

  @Property({ nullable: true, columnType: 'text' })
  public createdAt?: Date;

  @Property({ nullable: true, columnType: 'text' })
  public updatedAt?: Date;

  @Property({ nullable: true })
  public image?: string;

  @OneToMany(() => UserDevice, (userDevice) => userDevice.user)
  public userDevices = new Collection<UserDevice>(this);

  @OneToMany(() => File, (file) => file.createdBy)
  public fileUploads = new Collection<File>(this);
}
