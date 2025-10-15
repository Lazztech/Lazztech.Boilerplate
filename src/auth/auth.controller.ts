import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
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
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './user.decorator';
import { Payload } from './dto/payload.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async postRegister(
    @Body() body: RegisterDto,
    @Res() response: Response,
  ): Promise<any> {
    try {
      await transformAndValidate(RegisterDto, body);
    } catch (validationErrors: unknown) {
      return response.render('auth/register', {
        layout: 'layout',
        input: body,
        validationErrors,
      });
    }

    const jwt = await this.authService.register(body.email, body.password);
    response.cookie('access_token', jwt);
    return response.redirect('/auth/profile');
  }

  @Render('auth/register')
  @Post('validate/register')
  async getRegisterValidate(@Body() body: RegisterDto) {
    try {
      await transformAndValidate(RegisterDto, body);
      return { input: body };
    } catch (validationErrors) {
      return {
        input: body,
        validationErrors,
      };
    }
  }

  @Render('auth/login')
  @Post('login')
  async postLogin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const jwt = await this.authService.signIn(
        loginDto.email,
        loginDto.password,
      );
      response.cookie('access_token', jwt);
      return response.redirect('/auth/profile');
    } catch (error) {
      return {
        error,
      };
    }
  }

  @Redirect('/')
  @Get('logout')
  getLogout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
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
  getProfile(): any {}

  @UseGuards(AuthGuard)
  @Redirect('/', HttpStatus.SEE_OTHER) // https://hypermedia.systems/htmx-patterns/#_a_response_code_gotcha
  @Delete()
  async delete(
    @User() payload: Payload,
    @Res({ passthrough: true }) response: Response, // https://docs.nestjs.com/techniques/cookies#use-with-express-default
  ) {
    response.clearCookie('access_token');
    await this.authService.deleteUser(payload.userId);
  }
}
