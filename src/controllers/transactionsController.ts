import { Transaction } from '../models/Transaction';
import { Customer } from '../models/Customer';
import { Request, Response } from 'express';
import { Op } from 'sequelize';

export const createTransaction = (req: Request, res: Response) => {
  const {
    studio_id,
    type,
    amount,
    date,
    category_id,
    customer_id,
    payment_method,
    note,
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

export const getTransactions = async (req: Request, res: Response) => {
  try {

    const {
      studio_id,
      type,
      category_id,
      start_date,
      end_date,
      payment_method,
      client,
    } = req.query;

    const where: any = {};

    if (studio_id) {
      where.studio_id = studio_id;
    }

    if (type) {
      where.type = type;
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (payment_method) {
      where.payment_method = payment_method;
    }

    if (client) {
      where.client = client;
    }

    if (start_date && end_date) {
      where.date = {
        [Op.between]: [start_date, end_date],
      };
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'phone'],
        },
      ],
      order: [['date', 'DESC']],
    });

    res.status(200).json(transactions);

  } catch (error) {
    console.error('Error fetching transactions:', error);

    res.status(500).json({
      error: 'Failed to fetch transactions',
    });
  }
};

export const getTransactionById = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  Transaction.findByPk(id, {
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

export const getTransactionsByStudioId = (req: Request, res: Response) => {
  const rawStudioId = req.params.studioId;
  const studioId = Array.isArray(rawStudioId) ? rawStudioId[0] : rawStudioId;

  Transaction.findAll({ where: { studio_id: studioId } })
    .then((transactions) => {
      res.status(200).json(transactions);
    })
    .catch((error) => {
      console.error('Error fetching transactions by studio ID:', error);
      res.status(500).json({
        error: 'Failed to fetch transactions by studio ID',
      });
    });
};

export const updateTransaction = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const {
    type,
    amount,
    date,
    category_id,
    customer_id,
    payment_method,
    note,
  } = req.body;

  Transaction.findByPk(id)
    .then((transaction) => {
      if (transaction) {
        transaction
          .update({
            type,
            amount,
            date,
            category_id,
            customer_id,
            payment_method,
            note,
          })
          .then((updatedTransaction) => {
            res.status(200).json({ transaction: updatedTransaction });
          })
          .catch((error) => {
            console.error('Error updating transaction:', error);
            res.status(400).json({
              error: error?.message ?? 'Failed to update transaction',
              details: error?.errors?.map((e: any) => e.message),
            });
          });
      } else {
        res.status(404).json({ error: 'Transaction not found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching transaction for update:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch transaction for update' });
    });
};

export const deleteTransaction = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  Transaction.findByPk(id)
    .then((transaction) => {
      if (transaction) {
        transaction
          .destroy()
          .then(() => {
            res
              .status(200)
              .json({ message: 'Transaction deleted successfully' });
          })
          .catch((error) => {
            console.error('Error deleting transaction:', error);
            res.status(500).json({
              error: 'Failed to delete transaction',
            });
          });
      } else {
        res.status(404).json({ error: 'Transaction not found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching transaction for deletion:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch transaction for deletion' });
    });
};