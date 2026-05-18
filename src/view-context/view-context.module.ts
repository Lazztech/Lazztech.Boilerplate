import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { User } from '../dal/entity/user.entity';
import { ViewContextInterceptor } from './view-context.interceptor';
import { ViewContextService } from './view-context.service';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [ViewContextService, ViewContextInterceptor],
  exports: [ViewContextService, ViewContextInterceptor],
})
export class ViewContextModule {}
