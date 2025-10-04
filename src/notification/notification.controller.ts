import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @UseGuards(AuthGuard)
  @Post('subscribe')
  async postSubscribe(@Body() body: any) {
    const userId = 1;
    await this.notificationService.addUserWebPushNotificationSubscription(
      userId,
      body.subscription,
    );
  }
}
