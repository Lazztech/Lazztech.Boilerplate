import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { Match } from '../match.decorator';

export class RegisterDto {
  @IsString()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @Match('password', { message: 'Passwords must match' })
  confirmPassword: string;
}
