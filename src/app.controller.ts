import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Render,
  Sse,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);

  private message$ = new Subject<string>();

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
      message: this.appService.getHello(),
    };
  }

  @Sse('sse')
  getChatStream() {
    return this.message$;
  }

  @Post('message')
  async postMessages(@Body() body: any) {
    const message = body.message as string;
    this.message$.next(`<strong>User:</strong> ${message}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.message$.next(`
      <p><strong>Assistant:</strong> 1</p>
    `);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.message$.next(`
      <p><strong>Assistant:</strong> 2</p>
    `);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.message$.next(`
      <p><strong>Assistant:</strong> 3</p>
    `);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.message$.next(`
      <p><strong>Assistant:</strong> Hello World</p>
    `);
    this.logger.debug(`done with ${this.postMessages.name}`);
  }
}
