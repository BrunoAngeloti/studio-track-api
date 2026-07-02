import { Op } from 'sequelize'
import { Transaction } from '../models/Transaction'
import { Category } from '../models/Category'
import { Employee } from '../models/Employee'
import { Customer } from '../models/Customer'
import { getDateRangeByPeriod } from '../utils/dateFilters'
import { format } from 'date-fns'

type DashboardParams = {
  studioId: string
  period?: string
  startDate?: Date
  endDate?: Date
  employeeId?: string
}

const resolveDateRange = ({
  period,
  startDate,
  endDate,
}: {
  period?: string
  startDate?: Date
  endDate?: Date
}) => {

  if (startDate && endDate) {
    return { startDate, endDate }
  }

  return getDateRangeByPeriod(period || 'monthly')
}







/*
|--------------------------------------------------------------------------
| DASHBOARD SUMMARY
|--------------------------------------------------------------------------
*/

export const getDashboardSummaryService = async ({
  studioId,
  period,
  startDate,
  endDate,
  employeeId,
}: DashboardParams) => {

  const range = resolveDateRange({ period, startDate, endDate })

  const whereClause: any = {
    studio_id: studioId,
    date: {
      [Op.between]: [range.startDate, range.endDate],
    },
  }

  if (employeeId) {
    whereClause.responsible_employee_id = Number(employeeId)
  }

  const transactions = await Transaction.findAll({
    where: whereClause,
  })

  let income = 0
  let expense = 0
  let repasseTotal = 0

  transactions.forEach((transaction) => {

    const amount = Number(transaction.amount)

    if (transaction.type === 'INCOME') {

      income += amount

      if (transaction.repasse_percentage) {

        const repasseValue =
          amount * (Number(transaction.repasse_percentage) / 100)

        repasseTotal += repasseValue

      }

    }

    if (transaction.type === 'EXPENSE') {
      expense += amount
    }

  })

  const balance = income - expense
  const ownerNet = balance - repasseTotal

  return {
    income,
    expense,
    balance,
    repasse_total: repasseTotal,
    owner_net: ownerNet,
    startDate: range.startDate,
    endDate: range.endDate,
  }

}







/*
|--------------------------------------------------------------------------
| DASHBOARD CASHFLOW
|--------------------------------------------------------------------------
*/

export const getDashboardCashflowService = async ({
  studioId,
  period,
  startDate,
  endDate,
  employeeId,
}: DashboardParams) => {

  const range = resolveDateRange({ period, startDate, endDate })

  const whereClause: any = {
    studio_id: studioId,
    date: {
      [Op.between]: [range.startDate, range.endDate],
    },
  }

  if (employeeId) {
    whereClause.responsible_employee_id = Number(employeeId)
  }

  const transactions = await Transaction.findAll({
    where: whereClause,
    order: [['date', 'ASC']],
  })

  const grouped = new Map<
    string,
    { label: string; income: number; expense: number; balance: number }
  >()

  transactions.forEach((transaction) => {

    const date = new Date(transaction.date as Date)

    // força usar UTC (sem shift)
    const label = date.toISOString().slice(0, 10)

    if (!grouped.has(label)) {

      grouped.set(label, {
        label,
        income: 0,
        expense: 0,
        balance: 0,
      })

    }

    const current = grouped.get(label)!
    const amount = Number(transaction.amount)

    if (transaction.type === 'INCOME') current.income += amount
    if (transaction.type === 'EXPENSE') current.expense += amount

    current.balance = current.income - current.expense

  })

  return Array.from(grouped.values())

}







/*
|--------------------------------------------------------------------------
| DASHBOARD BY CATEGORY
|--------------------------------------------------------------------------
*/

export const getDashboardTransactionsByCategoryService = async ({
  studioId,
  period,
  startDate,
  endDate,
  type,
  employeeId,
}: DashboardParams & { type?: string }) => {

  const range = resolveDateRange({ period, startDate, endDate })

  const whereClause: any = {
    studio_id: studioId,
    date: {
      [Op.between]: [range.startDate, range.endDate],
    },
  }

  if (type) {
    whereClause.type = type
  }

  if (employeeId) {
    whereClause.responsible_employee_id = Number(employeeId)
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
  })

  const grouped = new Map<string, any>()

  transactions.forEach((transaction: any) => {

    const name = transaction.category?.name || 'Sem categoria'
    const color = transaction.category?.color || null

    if (!grouped.has(name)) {

      grouped.set(name, {
        category: name,
        color,
        total: 0,
      })

    }

    grouped.get(name).total += Number(transaction.amount)

  })

  return Array.from(grouped.values())

}







/*
|--------------------------------------------------------------------------
| DASHBOARD PAYMENT METHODS
|--------------------------------------------------------------------------
*/

export const getDashboardPaymentMethodsService = async ({
  studioId,
  period,
  startDate,
  endDate,
  employeeId,
}: DashboardParams) => {

  const range = resolveDateRange({ period, startDate, endDate })

  const whereClause: any = {
    studio_id: studioId,
    type: 'INCOME',
    date: {
      [Op.between]: [range.startDate, range.endDate],
    },
  }

  if (employeeId) {
    whereClause.responsible_employee_id = Number(employeeId)
  }

  const transactions = await Transaction.findAll({
    where: whereClause,
  })

  const grouped = new Map<string, number>()

  transactions.forEach((transaction) => {

    const method = transaction.payment_method || 'Unknown'

    if (!grouped.has(method)) {
      grouped.set(method, 0)
    }

    grouped.set(
      method,
      grouped.get(method)! + Number(transaction.amount)
    )

  })

  return Array.from(grouped.entries()).map(([payment_method, total]) => ({
    payment_method,
    total,
  }))

}







/*
|--------------------------------------------------------------------------
| DASHBOARD EMPLOYEES
|--------------------------------------------------------------------------
*/

export const getDashboardEmployeesService = async ({
  studioId,
  period,
  startDate,
  endDate,
}: DashboardParams) => {

  const range = resolveDateRange({ period, startDate, endDate })

  const transactions = await Transaction.findAll({
    where: {
      studio_id: studioId,
      type: 'INCOME',
      date: {
        [Op.between]: [range.startDate, range.endDate],
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
  startDate,
  endDate,
  employeeId,
}: {
  studioId: string
  limit: number
  startDate?: Date
  endDate?: Date
  employeeId?: string
}) => {

  const whereClause: any = {
    studio_id: studioId,
  }

  if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate],
    }
  }

  if (employeeId) {
    whereClause.responsible_employee_id = Number(employeeId)
  }

  const transactions = await Transaction.findAll({
    where: whereClause,
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['name', 'color'],
      },
      {
        model: Customer,
        as: 'customer',
        attributes: ['name'],
      },
    ],
    order: [['date', 'DESC']],
    limit,
  })

  return transactions.map((transaction: any) => ({
    id: transaction.id,
    type: transaction.type,
    amount: Number(transaction.amount),
    date: transaction.date,
    category: transaction.category?.name || null,
    category_color: transaction.category?.color || null,
    customer: transaction.customer?.name ? transaction.customer?.name : transaction.vendor ? transaction.vendor : null,
    payment_method: transaction.payment_method || null,
  }))

}