import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'Email address of the account to authenticate.',
    example: 'alex@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for the account.',
    example: 'StrongPass123!',
  })
  @IsNotEmpty()
  password: string;
}
