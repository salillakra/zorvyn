import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum TransactionFilterType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export class TransactionQueryDto {
  @ApiProperty({
    description: 'Filter by transaction type.',
    enum: TransactionFilterType,
    example: TransactionFilterType.EXPENSE,
  })
  @IsEnum(TransactionFilterType)
  type: TransactionFilterType;

  @ApiPropertyOptional({
    description: 'Filter by category ID.',
    example: 5,
  })
  @IsOptional()
  @IsInt()
  category_id?: number;

  @ApiPropertyOptional({
    description: 'Start datetime (ISO-8601).',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString() // Validates ISO8601 date strings
  from?: string;

  @ApiPropertyOptional({
    description: 'End datetime (ISO-8601).',
    example: '2026-05-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    description: 'Sort direction by createdAt.',
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sort?: SortOrder = SortOrder.ASC;

  @ApiPropertyOptional({
    description: 'Page number (1-indexed).',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Page size.',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
