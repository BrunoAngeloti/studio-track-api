"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransaction = exports.updateTransaction = exports.getTransactionById = exports.getTransactions = exports.createTransaction = void 0;
const Transaction_1 = require("../models/Transaction");
const Customer_1 = require("../models/Customer");
const Category_1 = require("../models/Category");
const Employee_1 = require("../models/Employee");
const sequelize_1 = require("sequelize");
const createTransaction = async (req, res) => {
    var _a, _b, _c;
    try {
        const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        if (!studio_id) {
            return res.status(400).json({ error: 'Studio ID is required' });
        }
        const { type, amount, date, category_id, customer_id, responsible_employee_id, repasse_employee_id, repasse_percentage, payment_method, note, vendor } = req.body;
        const transaction = await Transaction_1.Transaction.create({
            studio_id,
            type,
            amount,
            date,
            category_id,
            customer_id,
            responsible_employee_id,
            repasse_employee_id,
            repasse_percentage,
            payment_method,
            note,
            vendor
        });
        return res.status(201).json({ transaction });
    }
    catch (error) {
        console.error('Error creating transaction:', error);
        return res.status(400).json({
            error: (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'Failed to create transaction',
            details: (_c = error === null || error === void 0 ? void 0 : error.errors) === null || _c === void 0 ? void 0 : _c.map((e) => e.message),
        });
    }
};
exports.createTransaction = createTransaction;
const getTransactions = async (req, res) => {
    var _a;
    try {
        const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        if (!studio_id) {
            return res.status(400).json({ error: 'Studio ID is required' });
        }
        const { type, category_id, start_date, end_date, payment_method, search = '', page = '1', limit = '20', } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const offset = (pageNumber - 1) * limitNumber;
        const where = {
            studio_id,
        };
        if (type)
            where.type = type;
        if (category_id)
            where.category_id = category_id;
        if (payment_method)
            where.payment_method = payment_method;
        if (start_date && end_date) {
            where.date = {
                [sequelize_1.Op.between]: [start_date, end_date],
            };
        }
        if (search) {
            where[sequelize_1.Op.or] = [
                {
                    note: {
                        [sequelize_1.Op.iLike]: `%${search}%`,
                    },
                },
                {
                    vendor: {
                        [sequelize_1.Op.iLike]: `%${search}%`,
                    },
                },
                {
                    '$customer.name$': {
                        [sequelize_1.Op.iLike]: `%${search}%`,
                    },
                },
            ];
        }
        const { rows, count } = await Transaction_1.Transaction.findAndCountAll({
            where,
            include: [
                {
                    model: Customer_1.Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'phone'],
                    required: false,
                },
                {
                    model: Category_1.Category,
                    as: 'category',
                    attributes: ['id', 'name', 'color'],
                    required: false,
                },
                {
                    model: Employee_1.Employee,
                    as: 'responsible_employee',
                    attributes: ['id', 'name', 'role'],
                    required: false,
                },
                {
                    model: Employee_1.Employee,
                    as: 'repasse_employee',
                    attributes: ['id', 'name', 'role'],
                    required: false,
                },
            ],
            limit: limitNumber,
            offset,
            order: [['date', 'DESC']],
            distinct: true,
        });
        return res.status(200).json({
            data: rows,
            pagination: {
                total: count,
                page: pageNumber,
                limit: limitNumber,
                pages: Math.ceil(count / limitNumber),
            },
        });
    }
    catch (error) {
        console.error('Error fetching transactions:', error);
        return res.status(500).json({
            error: 'Failed to fetch transactions',
        });
    }
};
exports.getTransactions = getTransactions;
const getTransactionById = async (req, res) => {
    var _a;
    try {
        const id = req.params.id;
        const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const transaction = await Transaction_1.Transaction.findOne({
            where: {
                id,
                studio_id,
            },
            include: [
                {
                    model: Customer_1.Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'phone'],
                },
                {
                    model: Category_1.Category,
                    as: 'category',
                    attributes: ['id', 'name', 'color'],
                },
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
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        return res.status(200).json({ transaction });
    }
    catch (error) {
        console.error('Error fetching transaction:', error);
        return res.status(500).json({ error: 'Failed to fetch transaction' });
    }
};
exports.getTransactionById = getTransactionById;
const updateTransaction = async (req, res) => {
    var _a, _b, _c;
    try {
        const id = req.params.id;
        const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const { type, amount, date, category_id, customer_id, responsible_employee_id, repasse_employee_id, repasse_percentage, payment_method, note, vendor } = req.body;
        const transaction = await Transaction_1.Transaction.findOne({
            where: {
                id,
                studio_id,
            },
        });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        await transaction.update({
            type,
            amount,
            date,
            category_id,
            customer_id,
            responsible_employee_id,
            repasse_employee_id,
            repasse_percentage,
            payment_method,
            note,
            vendor
        });
        return res.status(200).json({ transaction });
    }
    catch (error) {
        console.error('Error updating transaction:', error);
        return res.status(400).json({
            error: (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'Failed to update transaction',
            details: (_c = error === null || error === void 0 ? void 0 : error.errors) === null || _c === void 0 ? void 0 : _c.map((e) => e.message),
        });
    }
};
exports.updateTransaction = updateTransaction;
const deleteTransaction = async (req, res) => {
    var _a;
    try {
        const id = req.params.id;
        const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const transaction = await Transaction_1.Transaction.findOne({
            where: {
                id,
                studio_id,
            },
        });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        await transaction.destroy();
        return res.status(200).json({
            message: 'Transaction deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting transaction:', error);
        return res.status(500).json({
            error: 'Failed to delete transaction',
        });
    }
};
exports.deleteTransaction = deleteTransaction;
