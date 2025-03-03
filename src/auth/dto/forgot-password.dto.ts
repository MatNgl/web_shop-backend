import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'mattheo.naegellen@gmail.com',
    description: 'Email de l’utilisateur',
  })
  @IsEmail()
  email: string;
}
