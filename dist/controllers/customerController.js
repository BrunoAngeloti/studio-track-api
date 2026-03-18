"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.getCustomerById = exports.unarchiveCustomer = exports.archiveCustomer = exports.getArchivedCustomers = exports.getCustomers = exports.createCustomer = void 0;
const Customer_1 = require("../models/Customer");
const sequelize_1 = require("sequelize");
const createCustomer = (req, res) => {
    var _a;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    if (!studio_id) {
        return res.status(400).json({ error: 'Studio ID is required' });
    }
    const { name, phone } = req.body;
    Customer_1.Customer.create({
        studio_id,
        name,
        phone,
        archived: false,
    })
        .then((customer) => {
        res.status(201).json({ customer });
    })
        .catch((error) => {
        var _a, _b;
        console.error('Error creating customer:', error);
        res.status(400).json({
            error: (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Failed to create customer',
            details: (_b = error === null || error === void 0 ? void 0 : error.errors) === null || _b === void 0 ? void 0 : _b.map((e) => e.message),
        });
    });
};
exports.createCustomer = createCustomer;
const getCustomers = async (req, res) => {
    var _a;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    const { search = '', page = 1, limit = 20, } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = {
        studio_id,
        archived: false,
    };
    if (search) {
        where.name = {
            [sequelize_1.Op.iLike]: `%${search}%`,
        };
    }
    try {
        const { rows, count } = await Customer_1.Customer.findAndCountAll({
            where,
            limit: Number(limit),
            offset,
            order: [['name', 'ASC']],
        });
        res.status(200).json({
            data: rows,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(count / Number(limit)),
            },
        });
    }
    catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            error: 'Failed to fetch customers',
        });
    }
};
exports.getCustomers = getCustomers;
const getArchivedCustomers = async (req, res) => {
    var _a;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const customers = await Customer_1.Customer.findAll({
            where: {
                studio_id,
                archived: true,
            },
            order: [['name', 'ASC']],
        });
        res.status(200).json(customers);
    }
    catch (error) {
        console.error('Error fetching archived customers:', error);
        res.status(500).json({
            error: 'Failed to fetch archived customers',
        });
    }
};
exports.getArchivedCustomers = getArchivedCustomers;
const archiveCustomer = async (req, res) => {
    var _a;
    const id = req.params.id;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const customer = await Customer_1.Customer.findOne({
            where: { id, studio_id },
        });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        await customer.update({
            archived: true,
        });
        res.status(200).json({
            message: 'Customer archived',
        });
    }
    catch (error) {
        console.error('Error archiving customer:', error);
        res.status(500).json({
            error: 'Failed to archive customer',
        });
    }
};
exports.archiveCustomer = archiveCustomer;
const unarchiveCustomer = async (req, res) => {
    var _a;
    const id = req.params.id;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const customer = await Customer_1.Customer.findOne({
            where: { id, studio_id },
        });
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        await customer.update({
            archived: false,
        });
        res.status(200).json({
            message: 'Customer restored',
        });
    }
    catch (error) {
        console.error('Error restoring customer:', error);
        res.status(500).json({
            error: 'Failed to restore customer',
        });
    }
};
exports.unarchiveCustomer = unarchiveCustomer;
const getCustomerById = (req, res) => {
    var _a;
    const id = req.params.id;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    Customer_1.Customer.findOne({
        where: {
            id,
            studio_id,
        },
    })
        .then((customer) => {
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.status(200).json({ customer });
    })
        .catch((error) => {
        console.error('Error fetching customer:', error);
        res.status(500).json({ error: 'Failed to fetch customer' });
    });
};
exports.getCustomerById = getCustomerById;
const updateCustomer = (req, res) => {
    var _a;
    const id = req.params.id;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    const { name, phone } = req.body;
    Customer_1.Customer.findOne({
        where: { id, studio_id },
    })
        .then((customer) => {
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        return customer.update({
            name,
            phone,
        });
    })
        .then((updatedCustomer) => {
        if (!updatedCustomer)
            return;
        res.status(200).json({
            customer: updatedCustomer,
        });
    })
        .catch((error) => {
        var _a, _b;
        console.error('Error updating customer:', error);
        res.status(400).json({
            error: (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : 'Failed to update customer',
            details: (_b = error === null || error === void 0 ? void 0 : error.errors) === null || _b === void 0 ? void 0 : _b.map((e) => e.message),
        });
    });
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = (req, res) => {
    var _a;
    const id = req.params.id;
    const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
    Customer_1.Customer.findOne({
        where: { id, studio_id },
    })
        .then((customer) => {
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        return customer.destroy();
    })
        .then((deleted) => {
        if (!deleted)
            return;
        res.status(200).json({
            message: 'Customer deleted successfully',
        });
    })
        .catch((error) => {
        console.error('Error deleting customer:', error);
        res.status(500).json({
            error: 'Failed to delete customer',
        });
    });
};
exports.deleteCustomer = deleteCustomer;
