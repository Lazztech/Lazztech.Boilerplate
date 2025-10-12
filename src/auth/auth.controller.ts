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
import { transformAndValidate } from 'class-transformer-validator';
import { type Response } from 'express';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Payload } from './dto/payload.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Redirect('/auth/profile')
  @Post('register')
  async postRegister(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) response: Response, // https://docs.nestjs.com/techniques/cookies#use-with-express-default
  ): Promise<any> {
    await transformAndValidate(RegisterDto, body);
    const jwt = await this.authService.register(body.email, body.password);
    response.cookie('access_token', jwt);
  }

  @Render('auth/register')
  @Post('validate/register')
  async getRegisterValidate(@Body() body: RegisterDto) {
    try {
      await transformAndValidate(RegisterDto, body);
    } catch (validationErrors) {
      console.log(validationErrors);
      return {
        input: body,
        validationErrors,
      };
    }
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
  getLogin(): any {}

  @Get('register')
  @Render('auth/register')
  getRegister(): any {}

  @UseGuards(AuthGuard)
  @Get('profile')
  @Render('auth/profile')
  getProfile(@User() user: Payload): any {
    return {
      user,
    };
  }
}
