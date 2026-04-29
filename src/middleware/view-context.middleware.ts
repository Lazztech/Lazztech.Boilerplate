import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { I18nContext } from 'nestjs-i18n';
import { auth } from 'src/auth/auth';
import { fromNodeHeaders } from 'better-auth/node';

@Injectable()
export class ViewContextMiddleware implements NestMiddleware {
  private logger = new Logger(ViewContextMiddleware.name);

  constructor(private configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    res.locals.appName = this.configService.get<string>('APP_NAME');
    res.locals.siteUrl = req.get('host');
    res.locals.baseUrl = req.baseUrl;
    res.locals.authEnabled = this.configService.get<boolean>('AUTH_ENABLED');
    res.locals.pwaEnabled = this.configService.get<boolean>('PWA_ENABLED');
    // Assign locale for i18n language selection
    res.locals.locale = I18nContext.current()?.lang;
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      res.locals.user = session?.user;
    } catch {
      this.logger.debug('User payload not available');
    }
    next();
  }
}
