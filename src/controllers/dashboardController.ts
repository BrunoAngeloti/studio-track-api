import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

import {
  getDashboardSummaryService,
  getDashboardCashflowService,
  getDashboardTransactionsByCategoryService,
  getDashboardPaymentMethodsService,
  getDashboardEmployeesService,
  getDashboardRecentTransactionsService,
} from '../services/dashboardService';
import { parseDate } from '../utils/string';

export const getDashboardSummary = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const studioId = req.studio?.id;

    const { period = 'monthly', start_date, end_date, employee_id } = req.query;

    const data = await getDashboardSummaryService({
      studioId: String(studioId),
      period: String(period),
      startDate: parseDate(start_date),
      endDate: parseDate(end_date),
      employeeId: employee_id ? String(employee_id) : undefined,
    });

    return res.json(data);

  } catch (error) {

    console.error('Dashboard summary error:', error);
    return res.status(500).json({ error: 'Failed to fetch summary' });

  }
};



export const getDashboardCashflow = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {

    const studioId = req.studio?.id;
    const { period = 'monthly', start_date, end_date, employee_id } = req.query;

    const data = await getDashboardCashflowService({
      studioId: String(studioId),
      period: String(period),
      startDate: parseDate(start_date),
      endDate: parseDate(end_date),
      employeeId: employee_id ? String(employee_id) : undefined,
    });

    return res.json(data);

  } catch (error) {

    console.error('Dashboard cashflow error:', error);
    return res.status(500).json({ error: 'Failed to fetch cashflow' });

  }
};



export const getDashboardCategories = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {

    const studioId = req.studio?.id;

    const { period = 'monthly', start_date, end_date, type, employee_id } = req.query;

    const data = await getDashboardTransactionsByCategoryService({
      studioId: String(studioId),
      period: String(period),
      type: type ? String(type) : undefined,
      startDate: parseDate(start_date),
      endDate: parseDate(end_date),
      employeeId: employee_id ? String(employee_id) : undefined,
    });

    return res.json(data);

  } catch (error) {

    console.error('Dashboard categories error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });

  }
};



export const getDashboardPaymentMethods = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {

    const studioId = req.studio?.id;

    const { period = 'monthly', start_date, end_date, employee_id } = req.query;

    const data = await getDashboardPaymentMethodsService({
      studioId: String(studioId),
      period: String(period),
      startDate: parseDate(start_date),
      endDate: parseDate(end_date),
      employeeId: employee_id ? String(employee_id) : undefined,
    });

    return res.json(data);

  } catch (error) {

    console.error('Dashboard payment methods error:', error);
    return res.status(500).json({ error: 'Failed to fetch payment methods' });

  }
};



export const getDashboardEmployees = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {

    const studioId = req.studio?.id;

    const { period = 'monthly', start_date, end_date } = req.query;

    const data = await getDashboardEmployeesService({
      studioId: String(studioId),
      period: String(period),
      startDate: parseDate(start_date),
      endDate: parseDate(end_date),
    });

    return res.json(data);

  } catch (error) {

    console.error('Dashboard employees error:', error);
    return res.status(500).json({ error: 'Failed to fetch employees data' });

  }
};



export const getDashboardRecentTransactions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {

    const studioId = req.studio?.id;

    const { limit = 10, start_date, end_date, employee_id } = req.query;

    const data = await getDashboardRecentTransactionsService({
      studioId: String(studioId),
      limit: Number(limit),
      startDate: parseDate(start_date),
      endDate: parseDate(end_date),
      employeeId: employee_id ? String(employee_id) : undefined,
    });

    return res.json(data);

  } catch (error) {

    console.error('Dashboard recent transactions error:', error);
    return res.status(500).json({ error: 'Failed to fetch recent transactions' });

  }
};