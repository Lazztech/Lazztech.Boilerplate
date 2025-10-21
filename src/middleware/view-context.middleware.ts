import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class ViewContextMiddleware implements NestMiddleware {
  private logger = new Logger(ViewContextMiddleware.name);

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    res.locals.appName = this.configService.get<string>('APP_NAME');
    res.locals.baseUrl = req.baseUrl;
    try {
      const token = req.cookies?.['access_token'] as string;
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });
      // Assign payload to gloabal view state
      res.locals.user = payload;
      // Assign locale for i18n language selection
      res.locals.locale = I18nContext.current()?.lang;
    } catch {
      this.logger.debug('User payload not available');
    }
    next();
  }
}
