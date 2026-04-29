import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type PushSubscription } from 'web-push';
import { Payload } from '../auth/dto/payload.dto';
import { User } from '../auth/user.decorator';
import { NotificationService } from './notification.service';
import { PushNotificationDto } from './dto/pushNotification.dto';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('notification')
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private configService: ConfigService,
  ) {}

  @AllowAnonymous()
  @Get('vapid-public-key')
  getVapidPublicKey() {
    return this.configService.getOrThrow<string>('PUBLIC_VAPID_KEY');
  }

  @Post('subscribe')
  async postSubscribe(
    @Headers('user-agent') userAgent: string,
    @User() payload: Payload,
    @Body() body: PushSubscription,
  ) {
    await this.notificationService.addUserWebPushNotificationSubscription(
      payload.userId,
      body,
      userAgent,
    );
  }

  @Post('test')
  async postTest(@User() payload: Payload) {
    await this.notificationService.sendWebPushNotification(
      {
        title: 'Test Web Push',
        body: 'body',
      } as PushNotificationDto,
      payload.userId,
    );
  }
}
