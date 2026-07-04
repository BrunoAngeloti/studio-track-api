import { Transaction } from '../models/Transaction';
import { Customer } from '../models/Customer';
import { Category } from '../models/Category';
import { Employee } from '../models/Employee';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Response } from 'express';
import { Op } from 'sequelize';
import { requireEmployeeIfTeam, StudioTypeValidationError } from '../utils/studioType';

export const createTransaction = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studio_id = req.studio?.id;

    if (!studio_id) {
      return res.status(400).json({ error: 'Studio ID is required' });
    }

    const {
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
    } = req.body;

    const resolvedResponsibleEmployeeId = await requireEmployeeIfTeam(studio_id, responsible_employee_id);

    const transaction = await Transaction.create({
      studio_id,
      type,
      amount,
      date,
      category_id,
      customer_id,
      responsible_employee_id: resolvedResponsibleEmployeeId,
      repasse_employee_id,
      repasse_percentage,
      payment_method,
      note,
      vendor
    });

    return res.status(201).json({ transaction });

  } catch (error: any) {

    if (error instanceof StudioTypeValidationError) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error('Error creating transaction:', error);

    return res.status(400).json({
      error: error?.message ?? 'Failed to create transaction',
      details: error?.errors?.map((e: any) => e.message),
    });
  }
};



export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {

    const studio_id = req.studio?.id;

    if (!studio_id) {
      return res.status(400).json({ error: 'Studio ID is required' });
    }

    const {
      type,
      status,
      category_id,
      start_date,
      end_date,
      payment_method,
      responsible_employee_id,
      search = '',
      page = '1',
      limit = '20',
    } = req.query as Record<string, string>;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const offset = (pageNumber - 1) * limitNumber;

    const where: any = {
      studio_id,
    };

    if (type) where.type = type;
    if (status) where.status = status;
    if (category_id) where.category_id = category_id;
    if (payment_method) where.payment_method = payment_method;
    if (responsible_employee_id) where.responsible_employee_id = Number(responsible_employee_id);

    if (start_date && end_date) {
      where.date = {
        [Op.between]: [start_date, end_date],
      };
    }

    if (search) {
      where[Op.or] = [
        {
          note: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          vendor: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          '$customer.name$': {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    const { rows, count } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone'],
          required: false,
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color'],
          required: false,
        },
        {
          model: Employee,
          as: 'responsible_employee',
          attributes: ['id', 'name', 'role'],
          required: false,
        },
        {
          model: Employee,
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

  } catch (error) {

    console.error('Error fetching transactions:', error);

    return res.status(500).json({
      error: 'Failed to fetch transactions',
    });
  }
};



export const getTransactionById = async (req: AuthenticatedRequest, res: Response) => {

  try {

    const id = req.params.id;
    const studio_id = req.studio?.id;

    const transaction = await Transaction.findOne({
      where: {
        id,
        studio_id,
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'color'],
        },
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
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.status(200).json({ transaction });

  } catch (error) {

    console.error('Error fetching transaction:', error);

    return res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};



export const updateTransaction = async (req: AuthenticatedRequest, res: Response) => {

  try {

    const id = req.params.id;
    const studio_id = req.studio?.id;

    if (!studio_id) {
      return res.status(400).json({ error: 'Studio ID is required' });
    }

    const {
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
    } = req.body;

    const transaction = await Transaction.findOne({
      where: {
        id,
        studio_id,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const resolvedResponsibleEmployeeId = await requireEmployeeIfTeam(studio_id, responsible_employee_id);

    await transaction.update({
      type,
      amount,
      date,
      category_id,
      customer_id,
      responsible_employee_id: resolvedResponsibleEmployeeId,
      repasse_employee_id,
      repasse_percentage,
      payment_method,
      note,
      vendor
    });

    return res.status(200).json({ transaction });

  } catch (error: any) {

    if (error instanceof StudioTypeValidationError) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error('Error updating transaction:', error);

    return res.status(400).json({
      error: error?.message ?? 'Failed to update transaction',
      details: error?.errors?.map((e: any) => e.message),
    });
  }
};



export const approveTransaction = async (req: AuthenticatedRequest, res: Response) => {

  try {

    const id = req.params.id;
    const studio_id = req.studio?.id;

    if (!studio_id) {
      return res.status(400).json({ error: 'Studio ID is required' });
    }

    const {
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
    } = req.body;

    const transaction = await Transaction.findOne({
      where: {
        id,
        studio_id,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'PENDING') {
      return res.status(400).json({ error: `Cannot approve a transaction with status ${transaction.status}` });
    }

    const resolvedResponsibleEmployeeId = responsible_employee_id !== undefined
      ? await requireEmployeeIfTeam(studio_id, responsible_employee_id)
      : transaction.responsible_employee_id;

    await transaction.update({
      status: 'CONFIRMED',
      amount: amount ?? transaction.amount,
      date: date ?? transaction.date,
      category_id: category_id ?? transaction.category_id,
      customer_id: customer_id ?? transaction.customer_id,
      responsible_employee_id: resolvedResponsibleEmployeeId,
      repasse_employee_id: repasse_employee_id ?? transaction.repasse_employee_id,
      repasse_percentage: repasse_percentage ?? transaction.repasse_percentage,
      payment_method: payment_method ?? transaction.payment_method,
      note: note ?? transaction.note,
      vendor: vendor ?? transaction.vendor,
    });

    return res.status(200).json({ transaction });

  } catch (error: any) {

    if (error instanceof StudioTypeValidationError) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error('Error approving transaction:', error);

    return res.status(400).json({
      error: error?.message ?? 'Failed to approve transaction',
      details: error?.errors?.map((e: any) => e.message),
    });
  }
};



export const rejectTransaction = async (req: AuthenticatedRequest, res: Response) => {

  try {

    const id = req.params.id;
    const studio_id = req.studio?.id;

    if (!studio_id) {
      return res.status(400).json({ error: 'Studio ID is required' });
    }

    const transaction = await Transaction.findOne({
      where: {
        id,
        studio_id,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'PENDING') {
      return res.status(400).json({ error: `Cannot reject a transaction with status ${transaction.status}` });
    }

    await transaction.update({ status: 'REJECTED' });

    return res.status(200).json({ transaction });

  } catch (error) {

    console.error('Error rejecting transaction:', error);

    return res.status(500).json({ error: 'Failed to reject transaction' });
  }
};



export const deleteTransaction = async (req: AuthenticatedRequest, res: Response) => {

  try {

    const id = req.params.id;
    const studio_id = req.studio?.id;

    const transaction = await Transaction.findOne({
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

  } catch (error) {

    console.error('Error deleting transaction:', error);

    return res.status(500).json({
      error: 'Failed to delete transaction',
    });
  }
};