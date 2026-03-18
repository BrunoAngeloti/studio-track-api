"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardRecentTransactionsService = exports.getDashboardEmployeesService = exports.getDashboardPaymentMethodsService = exports.getDashboardTransactionsByCategoryService = exports.getDashboardCashflowService = exports.getDashboardSummaryService = void 0;
const sequelize_1 = require("sequelize");
const Transaction_1 = require("../models/Transaction");
const Category_1 = require("../models/Category");
const Employee_1 = require("../models/Employee");
const Customer_1 = require("../models/Customer");
const dateFilters_1 = require("../utils/dateFilters");
const resolveDateRange = ({ period, startDate, endDate, }) => {
    if (startDate && endDate) {
        return { startDate, endDate };
    }
    return (0, dateFilters_1.getDateRangeByPeriod)(period || 'monthly');
};
/*
|--------------------------------------------------------------------------
| DASHBOARD SUMMARY
|--------------------------------------------------------------------------
*/
const getDashboardSummaryService = async ({ studioId, period, startDate, endDate, }) => {
    const range = resolveDateRange({ period, startDate, endDate });
    const transactions = await Transaction_1.Transaction.findAll({
        where: {
            studio_id: studioId,
            date: {
                [sequelize_1.Op.between]: [range.startDate, range.endDate],
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
                const repasseValue = amount * (Number(transaction.repasse_percentage) / 100);
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
        startDate: range.startDate,
        endDate: range.endDate,
    };
};
exports.getDashboardSummaryService = getDashboardSummaryService;
/*
|--------------------------------------------------------------------------
| DASHBOARD CASHFLOW
|--------------------------------------------------------------------------
*/
const getDashboardCashflowService = async ({ studioId, period, startDate, endDate, }) => {
    const range = resolveDateRange({ period, startDate, endDate });
    const transactions = await Transaction_1.Transaction.findAll({
        where: {
            studio_id: studioId,
            date: {
                [sequelize_1.Op.between]: [range.startDate, range.endDate],
            },
        },
        order: [['date', 'ASC']],
    });
    const grouped = new Map();
    transactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        // força usar UTC (sem shift)
        const label = date.toISOString().slice(0, 10);
        if (!grouped.has(label)) {
            grouped.set(label, {
                label,
                income: 0,
                expense: 0,
                balance: 0,
            });
        }
        const current = grouped.get(label);
        const amount = Number(transaction.amount);
        if (transaction.type === 'INCOME')
            current.income += amount;
        if (transaction.type === 'EXPENSE')
            current.expense += amount;
        current.balance = current.income - current.expense;
    });
    return Array.from(grouped.values());
};
exports.getDashboardCashflowService = getDashboardCashflowService;
/*
|--------------------------------------------------------------------------
| DASHBOARD BY CATEGORY
|--------------------------------------------------------------------------
*/
const getDashboardTransactionsByCategoryService = async ({ studioId, period, startDate, endDate, type, }) => {
    const range = resolveDateRange({ period, startDate, endDate });
    const whereClause = {
        studio_id: studioId,
        date: {
            [sequelize_1.Op.between]: [range.startDate, range.endDate],
        },
    };
    if (type) {
        whereClause.type = type;
    }
    const transactions = await Transaction_1.Transaction.findAll({
        where: whereClause,
        include: [
            {
                model: Category_1.Category,
                as: 'category',
                attributes: ['id', 'name', 'color'],
            },
        ],
    });
    const grouped = new Map();
    transactions.forEach((transaction) => {
        var _a, _b;
        const name = ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || 'Sem categoria';
        const color = ((_b = transaction.category) === null || _b === void 0 ? void 0 : _b.color) || null;
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
exports.getDashboardTransactionsByCategoryService = getDashboardTransactionsByCategoryService;
/*
|--------------------------------------------------------------------------
| DASHBOARD PAYMENT METHODS
|--------------------------------------------------------------------------
*/
const getDashboardPaymentMethodsService = async ({ studioId, period, startDate, endDate, }) => {
    const range = resolveDateRange({ period, startDate, endDate });
    const transactions = await Transaction_1.Transaction.findAll({
        where: {
            studio_id: studioId,
            type: 'INCOME',
            date: {
                [sequelize_1.Op.between]: [range.startDate, range.endDate],
            },
        },
    });
    const grouped = new Map();
    transactions.forEach((transaction) => {
        const method = transaction.payment_method || 'Unknown';
        if (!grouped.has(method)) {
            grouped.set(method, 0);
        }
        grouped.set(method, grouped.get(method) + Number(transaction.amount));
    });
    return Array.from(grouped.entries()).map(([payment_method, total]) => ({
        payment_method,
        total,
    }));
};
exports.getDashboardPaymentMethodsService = getDashboardPaymentMethodsService;
/*
|--------------------------------------------------------------------------
| DASHBOARD EMPLOYEES
|--------------------------------------------------------------------------
*/
const getDashboardEmployeesService = async ({ studioId, period, startDate, endDate, }) => {
    const range = resolveDateRange({ period, startDate, endDate });
    const transactions = await Transaction_1.Transaction.findAll({
        where: {
            studio_id: studioId,
            type: 'INCOME',
            date: {
                [sequelize_1.Op.between]: [range.startDate, range.endDate],
            },
        },
        include: [
            {
                model: Employee_1.Employee,
                as: 'responsible_employee',
                attributes: ['id', 'name', 'role'],
            },
            {
                model: Employee_1.Employee,
                as: 'repasse_employee',
                attributes: ['id', 'name', 'role'],
            },
        ],
    });
    const employees = new Map();
    transactions.forEach((transaction) => {
        const amount = Number(transaction.amount);
        const responsible = transaction.responsible_employee;
        if (responsible) {
            if (!employees.has(responsible.id)) {
                employees.set(responsible.id, {
                    employee_id: responsible.id,
                    employee_name: responsible.name,
                    role: responsible.role,
                    income_generated: 0,
                    repasse_received: 0,
                });
            }
            employees.get(responsible.id).income_generated += amount;
        }
        const repasseEmployee = transaction.repasse_employee;
        if (repasseEmployee && transaction.repasse_percentage) {
            const repasseValue = amount * (Number(transaction.repasse_percentage) / 100);
            if (!employees.has(repasseEmployee.id)) {
                employees.set(repasseEmployee.id, {
                    employee_id: repasseEmployee.id,
                    employee_name: repasseEmployee.name,
                    role: repasseEmployee.role,
                    income_generated: 0,
                    repasse_received: 0,
                });
            }
            employees.get(repasseEmployee.id).repasse_received += repasseValue;
        }
    });
    return Array.from(employees.values());
};
exports.getDashboardEmployeesService = getDashboardEmployeesService;
/*
|--------------------------------------------------------------------------
| DASHBOARD RECENT TRANSACTIONS
|--------------------------------------------------------------------------
*/
const getDashboardRecentTransactionsService = async ({ studioId, limit, startDate, endDate, }) => {
    const whereClause = {
        studio_id: studioId,
    };
    if (startDate && endDate) {
        whereClause.date = {
            [sequelize_1.Op.between]: [startDate, endDate],
        };
    }
    const transactions = await Transaction_1.Transaction.findAll({
        where: whereClause,
        include: [
            {
                model: Category_1.Category,
                as: 'category',
                attributes: ['name', 'color'],
            },
            {
                model: Customer_1.Customer,
                as: 'customer',
                attributes: ['name'],
            },
        ],
        order: [['date', 'DESC']],
        limit,
    });
    return transactions.map((transaction) => {
        var _a, _b, _c, _d;
        return ({
            id: transaction.id,
            type: transaction.type,
            amount: Number(transaction.amount),
            date: transaction.date,
            category: ((_a = transaction.category) === null || _a === void 0 ? void 0 : _a.name) || null,
            category_color: ((_b = transaction.category) === null || _b === void 0 ? void 0 : _b.color) || null,
            customer: ((_c = transaction.customer) === null || _c === void 0 ? void 0 : _c.name) ? (_d = transaction.customer) === null || _d === void 0 ? void 0 : _d.name : transaction.vendor ? transaction.vendor : null,
            payment_method: transaction.payment_method || null,
        });
    });
};
exports.getDashboardRecentTransactionsService = getDashboardRecentTransactionsService;
