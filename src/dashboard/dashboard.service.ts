import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaClient) {}

  async getSummary() {
    const grouped = await this.prisma.ledgerTransaction.groupBy({
      by: ['type'],
      where: {
        is_deleted: false,
      },
      _sum: {
        amount: true,
      },
      _count: {
        _all: true,
      },
    });

    const income = grouped.find((item) => item.type === 'Income');
    const expense = grouped.find((item) => item.type === 'Expense');

    const incomeTotal = income?._sum.amount ?? 0;
    const expenseTotal = expense?._sum.amount ?? 0;

    return {
      statusCode: 200,
      data: {
        incomeTotal,
        expenseTotal,
        balance: incomeTotal - expenseTotal,
        transactionCount: grouped.reduce(
          (acc, item) => acc + item._count._all,
          0,
        ),
      },
    };
  }

  async getTrends(months = 6) {
    const safeMonths = Number.isInteger(months) && months > 0 ? months : 6;
    const from = new Date();
    from.setMonth(from.getMonth() - (safeMonths - 1));
    from.setDate(1);
    from.setHours(0, 0, 0, 0);

    const rows = await this.prisma.ledgerTransaction.findMany({
      where: {
        is_deleted: false,
        createdAt: {
          gte: from,
        },
      },
      select: {
        amount: true,
        type: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const buckets = new Map<string, { income: number; expense: number }>();

    for (const row of rows) {
      const monthKey = row.createdAt.toISOString().slice(0, 7);
      const current = buckets.get(monthKey) ?? { income: 0, expense: 0 };

      if (row.type === 'Income') {
        current.income += row.amount;
      } else {
        current.expense += row.amount;
      }

      buckets.set(monthKey, current);
    }

    return {
      statusCode: 200,
      data: Array.from(buckets.entries()).map(([month, values]) => ({
        month,
        income: values.income,
        expense: values.expense,
        balance: values.income - values.expense,
      })),
    };
  }

  async getCategoryBreakdown() {
    const rows = await this.prisma.ledgerTransaction.findMany({
      where: {
        is_deleted: false,
        type: 'Expense',
      },
      select: {
        amount: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const buckets = new Map<number, { category: string; total: number }>();

    for (const row of rows) {
      const current = buckets.get(row.category.id) ?? {
        category: row.category.name,
        total: 0,
      };
      current.total += row.amount;
      buckets.set(row.category.id, current);
    }

    return {
      statusCode: 200,
      data: Array.from(buckets.values()).sort((a, b) => b.total - a.total),
    };
  }

  async getRecent(limit = 10) {
    const safeLimit = Number.isInteger(limit)
      ? Math.min(Math.max(limit, 1), 50)
      : 10;

    const data = await this.prisma.ledgerTransaction.findMany({
      where: {
        is_deleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: safeLimit,
      select: {
        id: true,
        amount: true,
        type: true,
        description: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      statusCode: 200,
      data,
    };
  }
}
