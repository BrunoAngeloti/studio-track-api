"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateEmployee = exports.deleteEmployee = exports.updateEmployee = exports.getEmployeeById = exports.getEmployees = exports.createEmployee = void 0;
const Employee_1 = require("../models/Employee");
const sequelize_1 = require("sequelize");
const createEmployee = async (req, res) => {
    var _a, _b, _c;
    try {
        const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        if (!studio_id) {
            return res.status(400).json({ error: 'Studio ID is required' });
        }
        const { name, role, } = req.body;
        const employee = await Employee_1.Employee.create({
            studio_id,
            name,
            role,
            active: true,
        });
        return res.status(201).json({ employee });
    }
    catch (error) {
        console.error('Error creating employee:', error);
        return res.status(400).json({
            error: (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'Failed to create employee',
            details: (_c = error === null || error === void 0 ? void 0 : error.errors) === null || _c === void 0 ? void 0 : _c.map((e) => e.message),
        });
    }
};
exports.createEmployee = createEmployee;
const getEmployees = async (req, res) => {
    var _a;
    try {
        const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const { search = '', page = '1', limit = '20', active } = req.query;
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const offset = (pageNumber - 1) * limitNumber;
        const where = {
            studio_id,
        };
        if (active !== undefined) {
            where.active = active === 'true';
        }
        if (search) {
            where[sequelize_1.Op.or] = [
                {
                    name: {
                        [sequelize_1.Op.iLike]: `%${search}%`,
                    },
                },
                {
                    role: {
                        [sequelize_1.Op.iLike]: `%${search}%`,
                    },
                },
            ];
        }
        const { rows, count } = await Employee_1.Employee.findAndCountAll({
            where,
            limit: limitNumber,
            offset,
            order: [['name', 'ASC']],
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
        console.error('Error fetching employees:', error);
        return res.status(500).json({
            error: 'Failed to fetch employees',
        });
    }
};
exports.getEmployees = getEmployees;
const getEmployeeById = async (req, res) => {
    var _a;
    try {
        const id = req.params.id;
        const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const employee = await Employee_1.Employee.findOne({
            where: {
                id,
                studio_id,
            },
        });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        return res.status(200).json({ employee });
    }
    catch (error) {
        console.error('Error fetching employee:', error);
        return res.status(500).json({
            error: 'Failed to fetch employee',
        });
    }
};
exports.getEmployeeById = getEmployeeById;
const updateEmployee = async (req, res) => {
    var _a, _b, _c;
    try {
        const id = req.params.id;
        const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const { name, role, active } = req.body;
        const employee = await Employee_1.Employee.findOne({
            where: {
                id,
                studio_id,
            },
        });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        await employee.update({
            name,
            role,
            active
        });
        return res.status(200).json({ employee });
    }
    catch (error) {
        console.error('Error updating employee:', error);
        return res.status(400).json({
            error: (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : 'Failed to update employee',
            details: (_c = error === null || error === void 0 ? void 0 : error.errors) === null || _c === void 0 ? void 0 : _c.map((e) => e.message),
        });
    }
};
exports.updateEmployee = updateEmployee;
const deleteEmployee = async (req, res) => {
    var _a;
    try {
        const id = req.params.id;
        const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const employee = await Employee_1.Employee.findOne({
            where: {
                id,
                studio_id,
            },
        });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        // Soft delete (recomendado)
        await employee.update({
            active: false,
        });
        return res.status(200).json({
            message: 'Employee deactivated successfully',
        });
    }
    catch (error) {
        console.error('Error deleting employee:', error);
        return res.status(500).json({
            error: 'Failed to delete employee',
        });
    }
};
exports.deleteEmployee = deleteEmployee;
const activateEmployee = async (req, res) => {
    var _a;
    try {
        const id = req.params.id;
        const studio_id = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const employee = await Employee_1.Employee.findOne({
            where: {
                id,
                studio_id,
            },
        });
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        await employee.update({
            active: true,
        });
        return res.status(200).json({
            message: 'Employee activated successfully',
        });
    }
    catch (error) {
        console.error('Error activating employee:', error);
        return res.status(500).json({
            error: 'Failed to activate employee',
        });
    }
};
exports.activateEmployee = activateEmployee;
