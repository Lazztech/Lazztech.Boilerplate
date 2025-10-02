import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  type Ref,
  Unique,
} from '@mikro-orm/core';
import { File } from './file.entity';
import { ShareableId } from './shareableId.entity';
import { PasswordReset } from './passwordReset.entity';

/* eslint-disable */ // needed for mikroorm default value & type which conflicts with typescript-eslint/no-unused-vars
@Entity()
export class User extends ShareableId {
  @PrimaryKey()
  public id!: number;

  @Unique()
  @Property({ nullable: true })
  public username?: string;

  @Property({ fieldName: 'firstName', nullable: true })
  public firstName?: string;

  @Property({ fieldName: 'lastName', nullable: true })
  public lastName?: string;

  @Property({ nullable: true })
  public birthdate?: string;

  @Property({ nullable: true })
  public description?: string;

  /**
   * Exposed as a field resolver
   */
  @ManyToOne({
    entity: () => File,
    ref: true,
    nullable: true,
  })
  public profileImage?: Ref<File>;

  @Unique()
  @Property({ nullable: true })
  public email?: string;

  @Property({ nullable: true })
  public phoneNumber?: string;

  @Property()
  public password!: string;

  @Property({ nullable: true })
  public lastOnline?: string;

  @OneToOne({
    entity: () => PasswordReset,
    cascade: [Cascade.ALL],
    fieldName: 'passwordResetId',
    nullable: true,
    ref: true,
    inversedBy: 'user',
  })
  public passwordReset!: Ref<PasswordReset>;

  @OneToMany(() => File, (file) => file.createdBy)
  public fileUploads = new Collection<File>(this);
}
