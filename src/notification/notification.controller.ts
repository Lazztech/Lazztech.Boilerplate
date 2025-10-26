import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from 'src/auth/user.decorator';
import { Payload } from 'src/auth/dto/payload.dto';
import { PushSubscription } from 'web-push';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @UseGuards(AuthGuard)
  @Post('subscribe')
  async postSubscribe(
    @User() payload: Payload,
    @Body() body: { subscription: PushSubscription },
  ) {
    await this.notificationService.addUserWebPushNotificationSubscription(
      payload.userId,
      body.subscription,
    );
  }
}
