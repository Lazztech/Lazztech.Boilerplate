import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../dal/entity/user.entity';
import webpush from 'web-push';
import _ from 'lodash';
import { UserDevice } from '../dal/entity/userDevice.entity';
import { PushNotificationDto } from './dto/pushNotification.dto';

@Injectable()
export class NotificationService {
  private logger = new Logger(NotificationService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: EntityRepository<User>,
    @InjectRepository(UserDevice)
    private userDeviceRepository: EntityRepository<UserDevice>,
    private readonly em: EntityManager,
  ) {
    webpush.setVapidDetails(
      this.configService.get('SITE_URL') || '',
      this.configService.get<string>('PUBLIC_VAPID_KEY') || '',
      this.configService.get<string>('PRIVATE_VAPID_KEY') || '',
    );
  }

  public async addUserWebPushNotificationSubscription(
    userId: any,
    subscription: webpush.PushSubscription,
    userAgent: string,
  ): Promise<void> {
    const user = await this.userRepository.findOneOrFail(
      { id: userId },
      {
        populate: ['userDevices'],
      },
    );
    const userDevices = await user?.userDevices?.loadItems();
    if (
      user &&
      !userDevices?.find((x) => _.isEqual(x.webPushSubscription, subscription))
    ) {
      const userDevice = this.userDeviceRepository.create({
        user: user.id,
        pushEndpoint: subscription.endpoint,
        webPushSubscription: subscription,
        userAgent,
      });
      await this.em.persistAndFlush(userDevice);
    } else {
      this.logger.warn(
        'User device web push notification subscription already stored.',
      );
    }
  }

  sendWebPushNotification(
    notification: PushNotificationDto,
    to: webpush.PushSubscription,
  ) {
    this.logger.debug(this.sendWebPushNotification.name);
    webpush
      .sendNotification(
        to,
        JSON.stringify({
          notification: {
            ...notification,
            icon: `${this.configService.get('SITE_URL')}/assets/${this.configService.getOrThrow('ICON_NAME')}`,
          },
        }),
      )
      .then((log) => {
        this.logger.debug('Push notification sent.');
        this.logger.debug(log);
      })
      .catch((error) => {
        this.logger.error(error);
      });
  }
}
