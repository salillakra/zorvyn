import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, Min } from 'class-validator';

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense',
}

export class CreateTransactionDto {
  @ApiProperty({
    description: 'Transaction amount.',
    example: 1250.5,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'Amount must be a positive number greater than 0.' })
  amount: number;

  @ApiProperty({
    description: 'Transaction type.',
    enum: TransactionType,
    example: TransactionType.EXPENSE,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Category identifier for this transaction.',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Category ID must be a positive integer.' })
  category_id: number;

  @ApiProperty({
    description: 'Human-readable transaction description.',
    example: 'Monthly office rent payment',
  })
  @IsString()
  description: string;
}
