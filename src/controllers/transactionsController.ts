import { Transaction } from '../models/Transaction';
import { Customer } from '../models/Customer';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Response } from 'express';
import { Op } from 'sequelize';

export const createTransaction = (req: AuthenticatedRequest, res: Response) => {

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
    payment_method,
    note,
    vendor
  } = req.body;

  Transaction.create({
    studio_id,
    type,
    amount,
    date,
    category_id,
    customer_id,
    payment_method,
    note,
    vendor
  })
    .then((transaction) => {
      res.status(201).json({ transaction });
    })
    .catch((error) => {
      console.error('Error creating transaction:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to create transaction',
        details: error?.errors?.map((e: any) => e.message),
      });
    });
};

export const getTransactions = async (req: AuthenticatedRequest, res: Response) => {
  try {

    const studio_id = req.studio?.id;

    const {
      type,
      category_id,
      start_date,
      end_date,
      payment_method,
      search = '',
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

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
          '$customer.name$': {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          vendor: {
            [Op.iLike]: `%${search}%`,
          },
        }
      ];
    }

    const { rows, count } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone'],
        },
      ],
      limit: Number(limit),
      offset,
      order: [['date', 'DESC']],
      distinct: true,
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

  } catch (error) {

    console.error('Error fetching transactions:', error);

    res.status(500).json({
      error: 'Failed to fetch transactions',
    });

  }
};

export const getTransactionById = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  Transaction.findOne({
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
    ],
  })
    .then((transaction) => {

      if (transaction) {
        res.status(200).json({ transaction });
      } else {
        res.status(404).json({ error: 'Transaction not found' });
      }

    })
    .catch((error) => {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ error: 'Failed to fetch transaction' });
    });
};

export const updateTransaction = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  const {
    type,
    amount,
    date,
    category_id,
    customer_id,
    payment_method,
    note,
    vendor
  } = req.body;

  Transaction.findOne({
    where: {
      id,
      studio_id,
    },
  })
    .then((transaction) => {

      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      return transaction.update({
        type,
        amount,
        date,
        category_id,
        customer_id,
        payment_method,
        note,
        vendor
      });

    })
    .then((updatedTransaction) => {

      if (updatedTransaction) {
        res.status(200).json({ transaction: updatedTransaction });
      }

    })
    .catch((error) => {

      console.error('Error updating transaction:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to update transaction',
        details: error?.errors?.map((e: any) => e.message),
      });
    });
};

export const deleteTransaction = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  Transaction.findOne({
    where: {
      id,
      studio_id,
    },
  })
    .then((transaction) => {

      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      return transaction.destroy();

    })
    .then(() => {

      res.status(200).json({
        message: 'Transaction deleted successfully',
      });

    })
    .catch((error) => {

      console.error('Error deleting transaction:', error);

      res.status(500).json({
        error: 'Failed to delete transaction',
      });
    });
};