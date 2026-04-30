import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Redirect,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { type Request, type Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { I18n, I18nContext } from 'nestjs-i18n';
import { auth } from './auth';
import { EmailDto } from './dto/email.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateEmailDto } from './dto/updateEmail.dto';
import { minutes, seconds, Throttle } from '@nestjs/throttler';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  @AllowAnonymous()
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

    try {
      const authResponse = await auth.api.signUpEmail({
        body: {
          email: body.email,
          password: body.password,
          name: body.email,
        },
        asResponse: true,
      });
      for (const cookie of authResponse.headers.getSetCookie()) {
        response.append('Set-Cookie', cookie);
      }
      return response.redirect('/auth/profile');
    } catch (error) {
      this.logger.warn(error);
      return response.render('auth/register', {
        layout: 'layout',
        input: body,
        error,
      });
    }
  }

  @AllowAnonymous()
  @Render('auth/register')
  @Post('validate/register')
  async postRegisterValidate(
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

  @AllowAnonymous()
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @Post('login')
  async postLogin(
    @Body() loginDto: LoginDto,
    @Res() response: Response,
  ) {
    try {
      const authResponse = await auth.api.signInEmail({
        body: {
          email: loginDto.email,
          password: loginDto.password,
        },
        asResponse: true,
      });
      for (const cookie of authResponse.headers.getSetCookie()) {
        response.append('Set-Cookie', cookie);
      }
      return response.redirect('/auth/profile');
    } catch (error) {
      this.logger.warn(error);
      return response.render('auth/login', {
        layout: 'layout',
        error,
      });
    }
  }

  @Get('logout')
  async getLogout(@Req() request: Request, @Res() response: Response) {
    const authResponse = await auth.api.signOut({
      headers: fromNodeHeaders(request.headers),
      asResponse: true,
    });
    for (const cookie of authResponse.headers.getSetCookie()) {
      response.append('Set-Cookie', cookie);
    }
    return response.redirect('/');
  }

  @AllowAnonymous()
  @Get('login')
  @Render('auth/login')
  getLogin(): any {}

  @AllowAnonymous()
  @Get('reset')
  @Render('auth/reset')
  getReset(@Query('email') emailQueryParam: string): any {
    return {
      input: {
        email: emailQueryParam,
      },
    };
  }

  @AllowAnonymous()
  @Post('reset')
  async postReset(
    @Body() emailDto: EmailDto,
    @Res() response: Response,
  ) {
    try {
      await auth.api.requestPasswordReset({
        body: {
          email: emailDto.email,
          redirectTo: '/auth/new-password',
        },
      });
    } catch (error) {
      this.logger.warn(error);
    }
    // Always show success to avoid email enumeration
    return response.render('auth/reset', {
      layout: 'layout',
      success: true,
      input: emailDto,
    });
  }

  @AllowAnonymous()
  @Get('new-password')
  @Render('auth/new-password')
  getNewPassword(@Query('token') token: string): any {
    return { token };
  }

  @AllowAnonymous()
  @Throttle({ default: { limit: 5, ttl: minutes(10) } })
  @Post('new-password')
  async postNewPassword(
    @Body() body: { token: string; password: string; confirmPassword: string },
    @Res() response: Response,
  ) {
    try {
      await auth.api.resetPassword({
        body: {
          token: body.token,
          newPassword: body.password,
        },
      });
      return response.redirect('/auth/login');
    } catch (error) {
      this.logger.warn(error);
      return response.render('auth/new-password', {
        layout: 'layout',
        token: body.token,
        error,
      });
    }
  }

  @AllowAnonymous()
  @Get('register')
  @Render('auth/register')
  getRegister(): any {}

  @Get('profile')
  @Render('auth/profile')
  getProfile(): any {}

  @Get('delete-account')
  @Render('auth/delete-account')
  getDeleteAccount(): any {}

  @Post('delete-account')
  async postDeleteAccount(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    try {
      // Verify credentials before deleting
      await auth.api.signInEmail({
        body: {
          email: loginDto.email,
          password: loginDto.password,
        },
      });
      const authResponse = await auth.api.deleteUser({
        headers: fromNodeHeaders(request.headers),
        asResponse: true,
      });
      for (const cookie of authResponse.headers.getSetCookie()) {
        response.append('Set-Cookie', cookie);
      }
      return response.redirect('/');
    } catch (error) {
      this.logger.warn(error);
      return response.render('auth/delete-account', {
        layout: 'layout',
        error,
      });
    }
  }

  @Get('update-email')
  @Render('auth/update-email')
  getUpdateEmail() {}

  @Render('auth/update-email')
  @Post('validate/update-email')
  async postValidateUpdateEmail(
    @I18n() i18n: I18nContext,
    @Body() body: UpdateEmailDto,
  ) {
    const instance = plainToInstance(UpdateEmailDto, body);
    const validationErrors = await i18n.validate(instance);
    if (validationErrors.length) {
      return {
        input: body,
        validationErrors,
      };
    }

    return { input: body };
  }

  @Post('update-email')
  async postUpdateEmail(
    @I18n() i18n: I18nContext,
    @Body() body: UpdateEmailDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const instance = plainToInstance(UpdateEmailDto, body);
    const validationErrors = await i18n.validate(instance);
    if (validationErrors.length) {
      return response.render('auth/update-email', {
        layout: 'layout',
        input: body,
        validationErrors,
      });
    }

    try {
      await auth.api.changeEmail({
        body: { newEmail: body.confirmEmail },
        headers: fromNodeHeaders(request.headers),
      });
      return response.redirect('/auth/profile');
    } catch (error) {
      this.logger.warn(error);
      return response.render('auth/update-email', {
        layout: 'layout',
        input: body,
        error,
      });
    }
  }
}
