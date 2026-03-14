import { Customer } from '../models/Customer';
import { Request, Response } from 'express';

export const createCustomer = (req: Request, res: Response) => {
  const { studio_id, name, phone } = req.body;

  Customer.create({
    studio_id,
    name,
    phone,
  })
    .then((customer) => {
      res.status(201).json({ customer });
    })
    .catch((error) => {
      console.error('Error creating customer:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to create customer',
        details: error?.errors?.map((e: any) => e.message),
      });
    });
};

export const getCustomers = (req: Request, res: Response) => {
  Customer.findAll()
    .then((customers) => {
      res.status(200).json(customers);
    })
    .catch((error) => {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    });
};

export const getCustomerById = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  Customer.findByPk(id)
    .then((customer) => {
      if (customer) {
        res.status(200).json({ customer });
      } else {
        res.status(404).json({ error: 'Customer not found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching customer:', error);
      res.status(500).json({ error: 'Failed to fetch customer' });
    });
};

export const getCustomersByStudioId = (req: Request, res: Response) => {
  const rawStudioId = req.params.studioId;
  const studioId = Array.isArray(rawStudioId) ? rawStudioId[0] : rawStudioId;

  Customer.findAll({ where: { studio_id: studioId } })
    .then((customers) => {
      res.status(200).json(customers);
    })
    .catch((error) => {
      console.error('Error fetching customers by studio ID:', error);
      res.status(500).json({
        error: 'Failed to fetch customers by studio ID',
      });
    });
};

export const updateCustomer = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { name, phone } = req.body;

  Customer.findByPk(id)
    .then((customer) => {
      if (customer) {
        customer
          .update({
            name,
            phone,
          })
          .then((updatedCustomer) => {
            res.status(200).json({ customer: updatedCustomer });
          })
          .catch((error) => {
            console.error('Error updating customer:', error);

            res.status(400).json({
              error: error?.message ?? 'Failed to update customer',
              details: error?.errors?.map((e: any) => e.message),
            });
          });
      } else {
        res.status(404).json({ error: 'Customer not found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching customer for update:', error);

      res
        .status(500)
        .json({ error: 'Failed to fetch customer for update' });
    });
};

export const deleteCustomer = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  Customer.findByPk(id)
    .then((customer) => {
      if (customer) {
        customer
          .destroy()
          .then(() => {
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
      } else {
        res.status(404).json({ error: 'Customer not found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching customer for deletion:', error);

      res
        .status(500)
        .json({ error: 'Failed to fetch customer for deletion' });
    });
};