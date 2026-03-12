import { Op } from 'sequelize';
import { Transaction } from '../models/Transaction';
import { Repasse } from '../models/Repasse';
import { Category } from '../models/Category';
import { getDateRangeByPeriod } from '../utils/dateFilters';

type SummaryParams = {
  studioId: string;
  period: string;
};

export const getDashboardSummaryService = async ({
  studioId,
  period,
}: SummaryParams) => {
  const { startDate, endDate } = getDateRangeByPeriod(period);

  const transactions = await Transaction.findAll({
    where: {
      studio_id: studioId,
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  const repasses = await Repasse.findAll({
    where: {
      studio_id: studioId,
    },
  });

  const income = transactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const expense = transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const balance = income - expense;

  const repassesSummary = repasses.map((repasse) => {
    const amount = (income * Number(repasse.percentage)) / 100;

    return {
      id: repasse.id,
      person_name: repasse.person_name,
      percentage: Number(repasse.percentage),
      amount,
    };
  });

  const repasseTotal = repassesSummary.reduce((sum, repasse) => sum + repasse.amount, 0);
  const ownerNet = balance - repasseTotal;

  return {
    period,
    startDate,
    endDate,
    income,
    expense,
    balance,
    repasse_total: repasseTotal,
    owner_net: ownerNet,
    repasses: repassesSummary,
  };
};

export const getDashboardTransactionsByCategoryService = async ({
  studioId,
  period,
  type,
}: {
  studioId: string;
  period: string;
  type?: string;
}) => {
  const { startDate, endDate } = getDateRangeByPeriod(period);

  const whereClause: any = {
    studio_id: studioId,
    date: {
      [Op.between]: [startDate, endDate],
    },
  };

  if (type) {
    whereClause.type = type;
  }

  const transactions = await Transaction.findAll({
    where: whereClause,
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'color'],
      },
    ],
  });

  const groupedMap = new Map<string, any>();

  transactions.forEach((transaction: any) => {
    const categoryName = transaction.category?.name || 'Sem categoria';
    const categoryColor = transaction.category?.color || null;
    const key = categoryName;

    if (!groupedMap.has(key)) {
      groupedMap.set(key, {
        category: categoryName,
        color: categoryColor,
        total: 0,
      });
    }

    const current = groupedMap.get(key);
    current.total += Number(transaction.amount);
  });

  return Array.from(groupedMap.values());
};

export const getDashboardTimelineService = async ({
  studioId,
  period,
}: {
  studioId: string;
  period: string;
}) => {
  const { startDate, endDate } = getDateRangeByPeriod(period);

  const transactions = await Transaction.findAll({
    where: {
      studio_id: studioId,
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [['date', 'ASC']],
  });

  const groupedMap = new Map<string, { label: string; income: number; expense: number; balance: number }>();

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date as Date);
    const label = transactionDate.toISOString().split('T')[0];

    if (!groupedMap.has(label)) {
      groupedMap.set(label, {
        label,
        income: 0,
        expense: 0,
        balance: 0,
      });
    }

    const current = groupedMap.get(label)!;

    if (transaction.type === 'INCOME') {
      current.income += Number(transaction.amount);
    }

    if (transaction.type === 'EXPENSE') {
      current.expense += Number(transaction.amount);
    }

    current.balance = current.income - current.expense;
  });

  return Array.from(groupedMap.values());
};

export const getDashboardRepassesService = async ({
  studioId,
  period,
}: {
  studioId: string;
  period: string;
}) => {
  const summary = await getDashboardSummaryService({ studioId, period });

  return {
    period: summary.period,
    gross_income: summary.income,
    repasse_total: summary.repasse_total,
    owner_net: summary.owner_net,
    repasses: summary.repasses,
  };
};