import {
  Cascade,
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  type Ref,
  Unique,
} from '@mikro-orm/core';
import { File } from './file.entity';
import { PasswordReset } from './passwordReset.entity';
import { ShareableId } from './shareableId.entity';
import { UserDevice } from './userDevice.entity';

@Entity()
export class User extends ShareableId {
  @PrimaryKey()
  public id!: number;

  @Property({ fieldName: 'firstName', nullable: true })
  public firstName?: string;

  @Property({ fieldName: 'lastName', nullable: true })
  public lastName?: string;

  @Unique()
  @Property({ nullable: true })
  public email?: string;

  @Property()
  public password!: string;

  @OneToOne({
    entity: () => PasswordReset,
    cascade: [Cascade.ALL],
    fieldName: 'passwordResetId',
    nullable: true,
    ref: true,
    inversedBy: 'user',
  })
  public passwordReset!: Ref<PasswordReset>;

  public userDevices = new Collection<UserDevice>(this);

  @OneToMany(() => File, (file) => file.createdBy)
  public fileUploads = new Collection<File>(this);
}
