import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { SortOrder, TransactionFilterType } from './dto/transactionQuery.dto';
import { CreateTransactionDto } from './dto/createTransaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaClient) {}
  private readonly logger = new Logger(TransactionsService.name);

  private parseOptionalInt(
    value: number | string | undefined,
  ): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : NaN;
  }

  async getAdminAudit(
    type: TransactionFilterType | null,
    category_id?: number | string,
    from?: string,
    to?: string,
    sort: SortOrder = SortOrder.DESC,
    page: number | string = 1,
    limit: number | string = 10,
  ) {
    try {
      if (!type) {
        return {
          statusCode: 400,
          error:
            'Type query parameter is required and must be either "Income" or "Expense".',
        };
      }

      if (
        type !== TransactionFilterType.INCOME &&
        type !== TransactionFilterType.EXPENSE
      ) {
        return {
          statusCode: 400,
          error: 'Type query parameter must be either "Income" or "Expense".',
        };
      }

      const parsedCategoryId = this.parseOptionalInt(category_id);
      if (Number.isNaN(parsedCategoryId)) {
        return {
          statusCode: 400,
          error: 'category_id must be an integer.',
        };
      }

      const parsedPage = Number(page);
      const parsedLimit = Number(limit);

      if (!Number.isInteger(parsedPage) || parsedPage < 1) {
        return {
          statusCode: 400,
          error: 'page must be an integer greater than or equal to 1.',
        };
      }

      if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 100
      ) {
        return {
          statusCode: 400,
          error: 'limit must be an integer between 1 and 100.',
        };
      }

      const transactions = this.prisma.ledgerTransaction;
      const data = await transactions.findMany({
        where: {
          type,
          is_deleted: false,
          categoryId: parsedCategoryId,
          createdAt: {
            gte: from ? new Date(from) : undefined,
            lte: to ? new Date(to) : undefined,
          },
        },
        orderBy: {
          createdAt: sort,
        },
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit,
      });
      return data;
    } catch (error) {
      this.logger.error(
        'Error occurred while fetching admin audit transactions',
        error,
      );
      throw new Error(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while fetching transactions.',
      );
    }
  }

  async getTransactionById(id: number) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        return {
          statusCode: 400,
          error: 'id must be a positive integer.',
        };
      }

      const transaction = await this.prisma.ledgerTransaction.findFirst({
        where: {
          id,
          is_deleted: false,
        },
      });

      if (!transaction) {
        return {
          statusCode: 404,
          error: 'Transaction not found.',
        };
      }

      return transaction;
    } catch (error) {
      this.logger.error(
        `Error occurred while fetching transaction with ID ${id}`,
        error,
      );

      throw new Error(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while fetching the transaction.',
      );
    }
  }

  async getDeletedTransactions(
    sort: SortOrder = SortOrder.DESC,
    page: number | string = 1,
    limit: number | string = 10,
  ) {
    try {
      const parsedPage = Number(page);
      const parsedLimit = Number(limit);

      if (!Number.isInteger(parsedPage) || parsedPage < 1) {
        return {
          statusCode: 400,
          error: 'page must be an integer greater than or equal to 1.',
        };
      }

      if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 100
      ) {
        return {
          statusCode: 400,
          error: 'limit must be an integer between 1 and 100.',
        };
      }

      const data = await this.prisma.ledgerTransaction.findMany({
        where: {
          is_deleted: true,
        },
        orderBy: {
          createdAt: sort,
        },
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit,
      });

      return data;
    } catch (error) {
      this.logger.error(
        'Error occurred while fetching deleted transactions',
        error,
      );
      throw new Error(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while fetching deleted transactions.',
      );
    }
  }

  async createTransaction(body: CreateTransactionDto) {
    try {
      const { amount, type, category_id, description } = body;

      const newTransaction = await this.prisma.ledgerTransaction.create({
        data: {
          amount,
          type,
          categoryId: category_id,
          description,
        },
      });

      return {
        statusCode: 201,
        message: 'Transaction created successfully.',
        data: newTransaction,
      };
    } catch (error) {
      this.logger.error('Error occurred while creating transaction', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while creating the transaction.',
      );
    }
  }

  async updateTransaction(id: number, body: CreateTransactionDto) {
    try {
      const { amount, type, category_id, description } = body;

      const existingTransaction = await this.prisma.ledgerTransaction.findFirst(
        {
          where: {
            id,
            is_deleted: false,
          },
        },
      );

      if (!existingTransaction) {
        return {
          statusCode: 404,
          error: 'Transaction not found.',
        };
      }

      const updatedTransaction = await this.prisma.ledgerTransaction.update({
        where: {
          id,
        },
        data: {
          amount,
          type,
          categoryId: category_id,
          description,
        },
      });

      return {
        statusCode: 200,
        message: 'Transaction updated successfully.',
        data: updatedTransaction,
      };
    } catch (error) {
      this.logger.error(
        `Error occurred while updating transaction with ID ${id}`,
        error,
      );
      throw new Error(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while updating the transaction.',
      );
    }
  }

  async deleteTransaction(id: number) {
    try {
      const existingTransaction = await this.prisma.ledgerTransaction.findFirst(
        {
          where: {
            id,
            is_deleted: false,
          },
        },
      );

      if (!existingTransaction) {
        return {
          statusCode: 404,
          error: 'Transaction not found.',
        };
      }

      await this.prisma.ledgerTransaction.update({
        where: {
          id,
        },
        data: {
          is_deleted: true,
        },
      });

      return {
        statusCode: 200,
        message: 'Transaction deleted successfully.',
      };
    } catch (error) {
      this.logger.error(
        `Error occurred while deleting transaction with ID ${id}`,
        error,
      );
      throw new Error(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while deleting the transaction.',
      );
    }
  }

  async restoreTransaction(id: number) {
    try {
      if (!Number.isInteger(id) || id < 1) {
        return {
          statusCode: 400,
          error: 'id must be a positive integer.',
        };
      }

      const existingTransaction = await this.prisma.ledgerTransaction.findFirst(
        {
          where: {
            id,
            is_deleted: true,
          },
        },
      );

      if (!existingTransaction) {
        return {
          statusCode: 404,
          error: 'Deleted transaction not found.',
        };
      }

      const restoredTransaction = await this.prisma.ledgerTransaction.update({
        where: {
          id,
        },
        data: {
          is_deleted: false,
        },
      });

      return {
        statusCode: 200,
        message: 'Transaction restored successfully.',
        data: restoredTransaction,
      };
    } catch (error) {
      this.logger.error(
        `Error occurred while restoring transaction with ID ${id}`,
        error,
      );
      throw new Error(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while restoring the transaction.',
      );
    }
  }
}
