"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardRecentTransactions = exports.getDashboardEmployees = exports.getDashboardPaymentMethods = exports.getDashboardCategories = exports.getDashboardCashflow = exports.getDashboardSummary = void 0;
const dashboardService_1 = require("../services/dashboardService");
const string_1 = require("../utils/string");
const getDashboardSummary = async (req, res) => {
    var _a;
    try {
        const studioId = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const { period = 'monthly', start_date, end_date } = req.query;
        const data = await (0, dashboardService_1.getDashboardSummaryService)({
            studioId: String(studioId),
            period: String(period),
            startDate: (0, string_1.parseDate)(start_date),
            endDate: (0, string_1.parseDate)(end_date),
        });
        return res.json(data);
    }
    catch (error) {
        console.error('Dashboard summary error:', error);
        return res.status(500).json({ error: 'Failed to fetch summary' });
    }
};
exports.getDashboardSummary = getDashboardSummary;
const getDashboardCashflow = async (req, res) => {
    var _a;
    try {
        const studioId = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const { period = 'monthly', start_date, end_date } = req.query;
        const data = await (0, dashboardService_1.getDashboardCashflowService)({
            studioId: String(studioId),
            period: String(period),
            startDate: (0, string_1.parseDate)(start_date),
            endDate: (0, string_1.parseDate)(end_date),
        });
        return res.json(data);
    }
    catch (error) {
        console.error('Dashboard cashflow error:', error);
        return res.status(500).json({ error: 'Failed to fetch cashflow' });
    }
};
exports.getDashboardCashflow = getDashboardCashflow;
const getDashboardCategories = async (req, res) => {
    var _a;
    try {
        const studioId = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const { period = 'monthly', start_date, end_date, type } = req.query;
        const data = await (0, dashboardService_1.getDashboardTransactionsByCategoryService)({
            studioId: String(studioId),
            period: String(period),
            type: type ? String(type) : undefined,
            startDate: (0, string_1.parseDate)(start_date),
            endDate: (0, string_1.parseDate)(end_date),
        });
        return res.json(data);
    }
    catch (error) {
        console.error('Dashboard categories error:', error);
        return res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
exports.getDashboardCategories = getDashboardCategories;
const getDashboardPaymentMethods = async (req, res) => {
    var _a;
    try {
        const studioId = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const { period = 'monthly', start_date, end_date } = req.query;
        const data = await (0, dashboardService_1.getDashboardPaymentMethodsService)({
            studioId: String(studioId),
            period: String(period),
            startDate: (0, string_1.parseDate)(start_date),
            endDate: (0, string_1.parseDate)(end_date),
        });
        return res.json(data);
    }
    catch (error) {
        console.error('Dashboard payment methods error:', error);
        return res.status(500).json({ error: 'Failed to fetch payment methods' });
    }
};
exports.getDashboardPaymentMethods = getDashboardPaymentMethods;
const getDashboardEmployees = async (req, res) => {
    var _a;
    try {
        const studioId = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const { period = 'monthly', start_date, end_date } = req.query;
        const data = await (0, dashboardService_1.getDashboardEmployeesService)({
            studioId: String(studioId),
            period: String(period),
            startDate: (0, string_1.parseDate)(start_date),
            endDate: (0, string_1.parseDate)(end_date),
        });
        return res.json(data);
    }
    catch (error) {
        console.error('Dashboard employees error:', error);
        return res.status(500).json({ error: 'Failed to fetch employees data' });
    }
};
exports.getDashboardEmployees = getDashboardEmployees;
const getDashboardRecentTransactions = async (req, res) => {
    var _a;
    try {
        const studioId = (_a = req.studio) === null || _a === void 0 ? void 0 : _a.id;
        const { limit = 10, start_date, end_date } = req.query;
        const data = await (0, dashboardService_1.getDashboardRecentTransactionsService)({
            studioId: String(studioId),
            limit: Number(limit),
            startDate: (0, string_1.parseDate)(start_date),
            endDate: (0, string_1.parseDate)(end_date),
        });
        return res.json(data);
    }
    catch (error) {
        console.error('Dashboard recent transactions error:', error);
        return res.status(500).json({ error: 'Failed to fetch recent transactions' });
    }
};
exports.getDashboardRecentTransactions = getDashboardRecentTransactions;
