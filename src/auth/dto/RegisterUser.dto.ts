import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Display name for the new user account.',
    example: 'Alex Johnson',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique email address used for sign-in.',
    example: 'alex@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Plain-text password for account creation.',
    example: 'StrongPass123!',
  })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'Optional avatar URL for the user profile.',
    example: 'https://example.com/avatar.png',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Optional post-registration redirect URL.',
    example: 'http://localhost:3000/welcome',
  })
  @IsOptional()
  @IsString()
  callbackURL?: string;
}
