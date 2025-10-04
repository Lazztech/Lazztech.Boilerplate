import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  type Ref,
} from '@mikro-orm/core';
import webpush from 'web-push';
import { User } from './user.entity';

@Entity()
export class UserDevice {
  @PrimaryKey()
  public id!: number;

  @Property({ type: 'json', nullable: true })
  webPushSubscription?: webpush.PushSubscription;

  @ManyToOne({
    entity: () => User,
    fieldName: 'userId',
    deleteRule: 'cascade',
    ref: true,
  })
  public user!: Ref<User>;
}
