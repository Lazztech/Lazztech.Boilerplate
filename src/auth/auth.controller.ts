import {
  Body,
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { type Response } from 'express';
import { User } from './user.decorator';
import { Payload } from './dto/payload.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Redirect('/auth/profile')
  @Post('register')
  async postRegister(
    @Body() registerDto: Record<string, string>,
    @Res({ passthrough: true }) response: Response, // https://docs.nestjs.com/techniques/cookies#use-with-express-default
  ): Promise<any> {
    const jwt = await this.authService.register(
      registerDto.email,
      registerDto.password,
    );
    response.cookie('access_token', jwt);
  }

  @Redirect('/auth/profile')
  @Post('login')
  async postLogin(
    @Body() signInDto: Record<string, any>,
    @Res({ passthrough: true }) response: Response,
  ) {
    const jwt = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );
    response.cookie('access_token', jwt);
  }

  @Redirect('/')
  @Get('logout')
  getLogout(@Res({ passthrough: true }) response: Response) {
    response.cookie('access_token', undefined);
  }

  @Get('login')
  @Render('auth/login')
  getLogin(): any {
    return {
      appName: this.configService.get('APP_NAME') as string,
    };
  }

  @Get('register')
  @Render('auth/register')
  getRegister(): any {
    return {
      appName: this.configService.get('APP_NAME') as string,
    };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @Render('auth/profile')
  getProfile(@User() user: Payload): any {
    return {
      appName: this.configService.get('APP_NAME') as string,
      user,
    };
  }
}
