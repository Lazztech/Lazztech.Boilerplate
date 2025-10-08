import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../dal/entity/user.entity';
import * as bcrypt from 'bcryptjs';
import { ChangePassword } from './dto/changePassword.input';
import { Payload } from './dto/payload.dto';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private jwtService: JwtService,
    private readonly em: EntityManager,
  ) {}

  async register(email: string, password: string): Promise<string> {
    this.logger.debug(this.register.name);
    const existingUser = await this.userRepository.findOne({ email });
    if (existingUser) {
      this.logger.debug(`User already exists with email address: ${email}`);
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    } as User);
    await this.em.persistAndFlush(user);

    return this.jwtService.signAsync({
      userId: user.id,
      email: user.email,
    } as Payload);
  }

  async signIn(email: string, pass: string): Promise<string> {
    const user = await this.userRepository.findOne({ email });
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    return this.jwtService.signAsync({
      userId: user.id,
      email: user.email,
    } as Payload);
  }

  public async changePassword(userId: any, details: ChangePassword) {
    this.logger.debug(this.changePassword.name);
    const user = await this.userRepository.findOneOrFail({ id: userId });

    if (await bcrypt.compare(details.oldPassword, user.password)) {
      const newHashedPassword = await bcrypt.hash(details.newPassword, 12);
      user.password = newHashedPassword;
      return await this.em.persistAndFlush(user);
    }
  }
}
