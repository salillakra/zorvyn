import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Updated display name for the user.',
    example: 'Alex J.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated profile image URL.',
    example: 'https://example.com/new-avatar.png',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'User lifecycle status.',
    enum: ['active', 'inactive'],
    example: 'active',
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiPropertyOptional({
    description: 'Role ID assigned to the user.',
    example: 'analyst',
  })
  @IsOptional()
  @IsString()
  roleId?: string;
}
