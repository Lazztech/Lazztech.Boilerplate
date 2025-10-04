import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Render,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Get('login')
  @Render('auth/login')
  getLogin(): any {
    return {
      appName: this.configService.get('APP_NAME') as string,
    };
  }

  @Get('signup')
  @Render('auth/signup')
  getSignup(): any {
    return {
      appName: this.configService.get('APP_NAME') as string,
    };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @Render('auth/profile')
  getProfile(): any {
    return {
      appName: this.configService.get('APP_NAME') as string,
    };
  }
}
