import { Transaction } from '../models/Transaction';
import { Customer } from '../models/Customer';
import { Category } from '../models/Category';
import { Employee } from '../models/Employee';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Response } from 'express';
import { Op } from 'sequelize';

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

    const transaction = await Transaction.create({
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

  } catch (error: any) {

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
      category_id,
      start_date,
      end_date,
      payment_method,
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
    if (category_id) where.category_id = category_id;
    if (payment_method) where.payment_method = payment_method;

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

  } catch (error: any) {

    console.error('Error updating transaction:', error);

    return res.status(400).json({
      error: error?.message ?? 'Failed to update transaction',
      details: error?.errors?.map((e: any) => e.message),
    });
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