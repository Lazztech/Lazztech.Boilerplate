import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Post,
  Query,
  Redirect,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { type Response } from 'express';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './user.decorator';
import { Payload } from './dto/payload.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { plainToInstance } from 'class-transformer';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { EmailDto } from './dto/email.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('register')
  async postRegister(
    @I18n() i18n: I18nContext,
    @Body() body: RegisterDto,
    @Res() response: Response,
  ): Promise<any> {
    const instance = plainToInstance(RegisterDto, body);
    const validationErrors = await i18n.validate(instance);
    if (validationErrors.length) {
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
  async getRegisterValidate(
    @I18n() i18n: I18nContext,
    @Body() body: RegisterDto,
  ) {
    const instance = plainToInstance(RegisterDto, body);
    const validationErrors = await i18n.validate(instance);
    if (validationErrors.length) {
      return {
        input: body,
        validationErrors,
      };
    }

    return { input: body };
  }

  @Post('login')
  async postLogin(@Body() loginDto: LoginDto, @Res() response: Response) {
    try {
      const jwt = await this.authService.signIn(
        loginDto.email,
        loginDto.password,
      );
      response.cookie('access_token', jwt);
      return response.redirect('/auth/profile');
    } catch (error) {
      this.logger.warn(error);
      return response.render('auth/login', {
        layout: 'layout',
        error,
      });
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

  @Get('reset')
  @Render('auth/reset')
  getReset(): any {}

  @Post('reset')
  async postReset(@Body() emailDto: EmailDto, @Res() response: Response) {
    try {
      await this.authService.sendPasswordResetEmail(emailDto.email);
      return response.redirect('/auth/reset-code');
    } catch (error) {
      this.logger.warn(error);
      return response.render('auth/reset', {
        layout: 'layout',
        error,
      });
    }
  }

  @Get('reset-code')
  @Render('auth/reset-code')
  getResetCode(@Query('email') emailQueryParam: string): any {
    return {
      input: {
        email: emailQueryParam,
      },
    };
  }

  @Render('auth/reset-code')
  @Post('validate/reset-code')
  async getResetCodeValidate(
    @I18n() i18n: I18nContext,
    @Body() body: ResetPasswordDto,
  ) {
    const instance = plainToInstance(ResetPasswordDto, body);
    const validationErrors = await i18n.validate(instance);
    if (validationErrors.length) {
      return {
        input: body,
        validationErrors,
      };
    }

    return { input: body };
  }

  @Post('reset-code')
  async postResetCode(
    @I18n() i18n: I18nContext,
    @Body() body: ResetPasswordDto,
    @Res() response: Response,
  ) {
    const instance = plainToInstance(ResetPasswordDto, body);
    const validationErrors = await i18n.validate(instance);
    if (validationErrors.length) {
      return response.render('auth/reset-code', {
        layout: 'layout',
        input: body,
        validationErrors,
      });
    }

    await this.authService.resetPassword(body);
    return response.redirect('/auth/login');
  }

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
