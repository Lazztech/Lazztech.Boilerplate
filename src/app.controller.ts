import { Body, Controller, Get, Post, Render } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private messages: { user: string; message: string }[] = [];

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @Render('index')
  getHello(): any {
    return {
      isProd: this.configService.get('NODE_ENV') == 'prod',
      appName: this.configService.get('APP_NAME') as string,
    };
  }

  @Get('messages')
  getMessages(): any {
    return this.messages
      .map((msg) => `<p><strong>${msg.user}:</strong> ${msg.message}</p>`)
      .join('');
  }

  @Post('message')
  async postMessages(@Body() body: any) {
    const message = body.message as string;
    this.messages.push({ user: 'user', message });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simple response logic
    const responseMessage = `Received your message: ${message}`;
    this.messages.push({ user: 'Assistant', message: responseMessage });

    return `
      <p><strong>Assistant:</strong> ${responseMessage}</p>
    `;
  }
}
