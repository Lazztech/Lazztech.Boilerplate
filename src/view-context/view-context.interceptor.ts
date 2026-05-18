import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RENDER_METADATA } from '@nestjs/common/constants';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ViewContextService } from './view-context.service';

@Injectable()
export class ViewContextInterceptor implements NestInterceptor {
  constructor(private readonly viewContextService: ViewContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const template = Reflect.getMetadata(RENDER_METADATA, context.getHandler());
    if (!template) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<FastifyRequest>();

    return next.handle().pipe(
      map(async (data) => {
        const ctx = await this.viewContextService.buildContext(req);
        return {
          ...ctx,
          ...(data ?? {}),
        };
      }),
    );
  }
}
