import { IsEmail, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';

export class ResetPassword {
  @IsString()
  @IsEmail(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'lang.validation.IS_EMAIL',
      ),
    },
  )
  usersEmail: string;

  resetPin: string;

  @IsString()
  @MinLength(8, {
    message: i18nValidationMessage<I18nTranslations>(
      'lang.validation.MIN_PASSWORD_LENGTH',
    ),
  })
  newPassword: string;
}
