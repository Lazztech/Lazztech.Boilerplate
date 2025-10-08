import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from '../dal/entity/user.entity';
import { PasswordReset } from '../dal/entity/passwordReset.entity';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    MikroOrmModule.forFeature([PasswordReset, User]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
