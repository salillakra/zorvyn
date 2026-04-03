import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RequireRoles } from '../auth/roles.decorator';
import { TransactionsService } from './transactions.service';
import {
  SortOrder,
  TransactionFilterType,
  TransactionQueryDto,
} from './dto/transactionQuery.dto';
import { CreateTransactionDto } from './dto/createTransaction.dto';

interface TransactionsRouteContract {
  getDeletedTransactions(
    sort: SortOrder,
    page: number | string,
    limit: number | string,
  ): unknown;
  restoreTransaction(id: number): unknown;
}

@ApiTags('Transactions')
@ApiBearerAuth('bearer')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}
  // transactions?type=Income&category_id=1&from=2023-01-01&to=2023-12-31&sort=asc&page=1&limit=10
  @ApiOperation({
    summary: 'List active transactions with filters and pagination.',
  })
  @ApiQuery({ name: 'type', enum: TransactionFilterType, required: true })
  @ApiQuery({ name: 'category_id', required: false, type: Number })
  @ApiQuery({
    name: 'from',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: String,
    format: 'date-time',
  })
  @ApiQuery({ name: 'sort', required: false, enum: SortOrder })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Transactions fetched successfully.' })
  @Get()
  @RequireRoles('analyst', 'viewer')
  getTransactions(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    )
    query: TransactionQueryDto,
  ) {
    return this.transactionsService.getAdminAudit(
      query.type,
      query.category_id,
      query.from,
      query.to,
      query.sort,
      query.page,
      query.limit,
    );
  }

  // transactions/:id
  @ApiOperation({ summary: 'List soft-deleted transactions.' })
  @ApiQuery({ name: 'sort', required: false, enum: SortOrder })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Deleted transactions fetched successfully.' })
  @Get('deleted')
  @RequireRoles('analyst', 'admin')
  getDeletedTransactions(
    @Query('sort') sort: SortOrder = SortOrder.DESC,
    @Query('page') page: number | string = 1,
    @Query('limit') limit: number | string = 10,
  ): unknown {
    const service = this.transactionsService as TransactionsRouteContract;
    return service.getDeletedTransactions(sort, page, limit);
  }

  // transactions/:id
  @ApiOperation({ summary: 'Get one active transaction by ID.' })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID.' })
  @ApiOkResponse({ description: 'Transaction returned.' })
  @Get(':id')
  @RequireRoles('analyst', 'viewer')
  getTransactionById(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.getTransactionById(id);
  }

  // transactions
  @ApiOperation({ summary: 'Create a new transaction.' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiOkResponse({ description: 'Transaction created successfully.' })
  @Post()
  @RequireRoles('analyst')
  createTransaction(@Body() body: CreateTransactionDto) {
    return this.transactionsService.createTransaction(body);
  }

  // transactions/:id
  @ApiOperation({ summary: 'Update an existing transaction.' })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID.' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiOkResponse({ description: 'Transaction updated successfully.' })
  @Put(':id')
  @RequireRoles('analyst')
  updateTransaction(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateTransactionDto,
  ) {
    return this.transactionsService.updateTransaction(id, body);
  }

  ///transactions/:id
  @ApiOperation({ summary: 'Soft-delete a transaction.' })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID.' })
  @ApiOkResponse({ description: 'Transaction deleted successfully.' })
  @Delete(':id')
  @RequireRoles('analyst')
  deleteTransaction(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.deleteTransaction(id);
  }

  // transactions/:id/restore
  @ApiOperation({ summary: 'Restore a soft-deleted transaction.' })
  @ApiParam({ name: 'id', type: Number, description: 'Transaction ID.' })
  @ApiOkResponse({ description: 'Transaction restored successfully.' })
  @Patch(':id/restore')
  @RequireRoles('analyst', 'admin')
  restoreTransaction(@Param('id', ParseIntPipe) id: number): unknown {
    const service = this.transactionsService as TransactionsRouteContract;
    return service.restoreTransaction(id);
  }
}
