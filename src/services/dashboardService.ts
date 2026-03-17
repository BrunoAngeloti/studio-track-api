import { Op } from 'sequelize';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';
import { Employee } from '../models/Employee';
import { Customer } from '../models/Customer';
import { getDateRangeByPeriod } from '../utils/dateFilters';

type PeriodParams = {
  studioId: string;
  period: string;
};





/*
|--------------------------------------------------------------------------
| DASHBOARD SUMMARY
|--------------------------------------------------------------------------
*/

export const getDashboardSummaryService = async ({
  studioId,
  period,
}: PeriodParams) => {

  const { startDate, endDate } = getDateRangeByPeriod(period);

  const transactions = await Transaction.findAll({
    where: {
      studio_id: studioId,
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  let income = 0;
  let expense = 0;
  let repasseTotal = 0;

  transactions.forEach((transaction) => {

    const amount = Number(transaction.amount);

    if (transaction.type === 'INCOME') {

      income += amount;

      if (transaction.repasse_percentage) {

        const repasseValue =
          amount * (Number(transaction.repasse_percentage) / 100);

        repasseTotal += repasseValue;

      }

    }

    if (transaction.type === 'EXPENSE') {
      expense += amount;
    }

  });

  const balance = income - expense;
  const ownerNet = balance - repasseTotal;

  return {
    income,
    expense,
    balance,
    repasse_total: repasseTotal,
    owner_net: ownerNet,
    startDate,
    endDate,
  };

};





/*
|--------------------------------------------------------------------------
| DASHBOARD CASHFLOW
|--------------------------------------------------------------------------
*/

export const getDashboardCashflowService = async ({
  studioId,
  period,
}: PeriodParams) => {

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

  const grouped = new Map<
    string,
    { label: string; income: number; expense: number; balance: number }
  >();

  transactions.forEach((transaction) => {

    const date = new Date(transaction.date as Date);
    const label = date.toISOString().split('T')[0];

    if (!grouped.has(label)) {

      grouped.set(label, {
        label,
        income: 0,
        expense: 0,
        balance: 0,
      });

    }

    const current = grouped.get(label)!;
    const amount = Number(transaction.amount);

    if (transaction.type === 'INCOME') {
      current.income += amount;
    }

    if (transaction.type === 'EXPENSE') {
      current.expense += amount;
    }

    current.balance = current.income - current.expense;

  });

  return Array.from(grouped.values());

};





/*
|--------------------------------------------------------------------------
| DASHBOARD BY CATEGORY
|--------------------------------------------------------------------------
*/

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

  const grouped = new Map<string, any>();

  transactions.forEach((transaction: any) => {

    const name = transaction.category?.name || 'Sem categoria';
    const color = transaction.category?.color || null;

    if (!grouped.has(name)) {

      grouped.set(name, {
        category: name,
        color,
        total: 0,
      });

    }

    grouped.get(name).total += Number(transaction.amount);

  });

  return Array.from(grouped.values());

};





/*
|--------------------------------------------------------------------------
| DASHBOARD PAYMENT METHODS
|--------------------------------------------------------------------------
*/

export const getDashboardPaymentMethodsService = async ({
  studioId,
  period,
}: PeriodParams) => {

  const { startDate, endDate } = getDateRangeByPeriod(period);

  const transactions = await Transaction.findAll({
    where: {
      studio_id: studioId,
      type: 'INCOME',
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  const grouped = new Map<string, number>();

  transactions.forEach((transaction) => {

    const method = transaction.payment_method || 'Unknown';

    if (!grouped.has(method)) {
      grouped.set(method, 0);
    }

    grouped.set(
      method,
      grouped.get(method)! + Number(transaction.amount)
    );

  });

  return Array.from(grouped.entries()).map(([payment_method, total]) => ({
    payment_method,
    total,
  }));

};





/*
|--------------------------------------------------------------------------
| DASHBOARD EMPLOYEES (REPASSES)
|--------------------------------------------------------------------------
*/

export const getDashboardEmployeesService = async ({
  studioId,
  period,
}: {
  studioId: string
  period: string
}) => {

  const { startDate, endDate } = getDateRangeByPeriod(period)

  const transactions = await Transaction.findAll({
    where: {
      studio_id: studioId,
      type: 'INCOME',
      date: {
        [Op.between]: [startDate, endDate],
      },
    },
    include: [
      {
        model: Employee,
        as: 'responsible_employee',
        attributes: ['id', 'name', 'role'],
      },
      {
        model: Employee,
        as: 'repasse_employee',
        attributes: ['id', 'name', 'role'],
      },
    ],
  })

  const employees = new Map<number, any>()

  transactions.forEach((transaction: any) => {

    const amount = Number(transaction.amount)

    /*
    RESPONSIBLE EMPLOYEE (gerou receita)
    */

    const responsible = transaction.responsible_employee

    if (responsible) {

      if (!employees.has(responsible.id)) {

        employees.set(responsible.id, {
          employee_id: responsible.id,
          employee_name: responsible.name,
          role: responsible.role,
          income_generated: 0,
          repasse_received: 0,
        })

      }

      employees.get(responsible.id).income_generated += amount

    }

    /*
    REPASSE EMPLOYEE (recebe comissão)
    */

    const repasseEmployee = transaction.repasse_employee

    if (repasseEmployee && transaction.repasse_percentage) {

      const repasseValue =
        amount * (Number(transaction.repasse_percentage) / 100)

      if (!employees.has(repasseEmployee.id)) {

        employees.set(repasseEmployee.id, {
          employee_id: repasseEmployee.id,
          employee_name: repasseEmployee.name,
          role: repasseEmployee.role,
          income_generated: 0,
          repasse_received: 0,
        })

      }

      employees.get(repasseEmployee.id).repasse_received += repasseValue

    }

  })

  return Array.from(employees.values())
}





/*
|--------------------------------------------------------------------------
| DASHBOARD RECENT TRANSACTIONS
|--------------------------------------------------------------------------
*/

export const getDashboardRecentTransactionsService = async ({
  studioId,
  limit,
}: {
  studioId: string;
  limit: number;
}) => {

  const transactions = await Transaction.findAll({
    where: {
      studio_id: studioId,
    },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['name'],
      },
      {
        model: Customer,
        as: 'customer',
        attributes: ['name'],
      },
    ],
    order: [['date', 'DESC']],
    limit,
  });

  return transactions.map((transaction: any) => ({
    id: transaction.id,
    type: transaction.type,
    amount: Number(transaction.amount),
    date: transaction.date,
    category: transaction.category?.name || null,
    customer: transaction.customer?.name || null,
    payment_method: transaction.payment_method || null,
  }));

};