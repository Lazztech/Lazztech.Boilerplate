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
import { AuthGuard } from '../auth/auth.guard';
import { Payload } from '../auth/dto/payload.dto';
import { User } from '../auth/user.decorator';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private configService: ConfigService,
  ) {}

  @Get('vapid-public-key')
  getVapidPublicKey() {
    return this.configService.getOrThrow<string>('PUBLIC_VAPID_KEY');
  }

  @UseGuards(AuthGuard)
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
}
