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
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { EmailDto } from './dto/email.dto';
import { LoginDto } from './dto/login.dto';
import { Payload } from './dto/payload.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { User } from './user.decorator';
import { UpdateEmailDto } from './dto/updateEmail.dto';
import { minutes, seconds, Throttle } from '@nestjs/throttler';
import { ViewContextService } from '../view-context/view-context.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private viewContextService: ViewContextService,
  ) {}

  @Post('register')
  async postRegister(
    @I18n() i18n: I18nContext,
    @Body() body: RegisterDto,
    @Res() reply: FastifyReply,
    @Req() req: FastifyRequest,
  ): Promise<any> {
    const instance = plainToInstance(RegisterDto, body);
    const validationErrors = await i18n.validate(instance);
    if (validationErrors.length) {
      const ctx = await this.viewContextService.buildContext(req);
      return reply.view('auth/register', {
        layout: 'layout',
        input: body,
        validationErrors,
        ...ctx,
      });
    }

    const jwt = await this.authService.register(body.email, body.password);
    reply.setCookie('access_token', jwt, { path: '/' });
    return reply.redirect('/auth/profile');
  }

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

  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @Post('login')
  async postLogin(
    @Body() loginDto: LoginDto,
    @Res() reply: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    try {
      const jwt = await this.authService.signIn(
        loginDto.email,
        loginDto.password,
      );
      reply.setCookie('access_token', jwt, { path: '/' });
      return reply.redirect('/auth/profile');
    } catch (error) {
      this.logger.warn(error);
      const ctx = await this.viewContextService.buildContext(req);
      return reply.view('auth/login', {
        layout: 'layout',
        error,
        ...ctx,
      });
    }
  }

  @Redirect('/')
  @Get('logout')
  getLogout(@Res({ passthrough: true }) reply: FastifyReply) {
    reply.clearCookie('access_token', { path: '/' });
  }

  @Get('login')
  @Render('auth/login')
  getLogin(): any {}

  @Get('reset')
  @Render('auth/reset')
  getReset(@Query('email') emailQueryParam: string): any {
    return {
      input: {
        email: emailQueryParam,
      },
    };
  }

  @Post('reset')
  async postReset(
    @Body() emailDto: EmailDto,
    @Res() reply: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    try {
      await this.authService.sendPasswordResetEmail(emailDto.email);
      return reply.redirect(`/auth/reset-code?email=${emailDto.email}`);
    } catch (error) {
      this.logger.warn(error);
      const ctx = await this.viewContextService.buildContext(req);
      return reply.view('auth/reset', {
        layout: 'layout',
        error,
        ...ctx,
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

  @Throttle({ default: { limit: 5, ttl: minutes(10) } })
  @Render('auth/reset-code')
  @Post('validate/reset-code')
  async postResetCodeValidate(
    @I18n() i18n: I18nContext,
    @Body() body: ResetPasswordDto,
  ) {
    console.log(body);
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
    @Res() reply: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    const instance = plainToInstance(ResetPasswordDto, body);
    const validationErrors = await i18n.validate(instance);
    if (validationErrors.length) {
      const ctx = await this.viewContextService.buildContext(req);
      return reply.view('auth/reset-code', {
        layout: 'layout',
        input: body,
        validationErrors,
        ...ctx,
      });
    }

    await this.authService.resetPassword(body);
    return reply.redirect('/auth/login');
  }

  @Get('register')
  @Render('auth/register')
  getRegister(): any {}

  @UseGuards(AuthGuard)
  @Get('profile')
  @Render('auth/profile')
  getProfile(): any {}

  @UseGuards(AuthGuard)
  @Get('delete-account')
  @Render('auth/delete-account')
  getDeleteAccount(): any {}

  @UseGuards(AuthGuard)
  @Post('delete-account')
  async postDeleteAccount(
    @User() payload: Payload,
    @Body() loginDto: LoginDto,
    @Res() reply: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    try {
      await this.authService.signIn(loginDto.email, loginDto.password);
      await this.authService.deleteUser(payload.userId);
      reply.clearCookie('access_token', { path: '/' });
      return reply.redirect('/');
    } catch (error) {
      this.logger.warn(error);
      const ctx = await this.viewContextService.buildContext(req);
      return reply.view('auth/delete-account', {
        layout: 'layout',
        error,
        ...ctx,
      });
    }
  }

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Post('update-email')
  async postUpdateEmail(
    @User() payload: Payload,
    @I18n() i18n: I18nContext,
    @Body() body: UpdateEmailDto,
    @Res() reply: FastifyReply,
    @Req() req: FastifyRequest,
  ) {
    const instance = plainToInstance(UpdateEmailDto, body);
    const validationErrors = await i18n.validate(instance);
    if (validationErrors.length) {
      const ctx = await this.viewContextService.buildContext(req);
      return reply.view('auth/update-email', {
        layout: 'layout',
        input: body,
        validationErrors,
        ...ctx,
      });
    }

    await this.authService.changeEmail(payload.userId, body.confirmEmail);
    return reply.redirect('/auth/profile');
  }
}
