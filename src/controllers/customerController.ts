import { Customer } from '../models/Customer';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const createCustomer = (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;
  if (!studio_id) {
    return res.status(400).json({ error: 'Studio ID is required' });
  }
  const { name, phone } = req.body;

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

export const getCustomers = (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;

  Customer.findAll({
    where: { studio_id },
    order: [['name', 'ASC']],
  })
    .then((customers) => {
      res.status(200).json(customers);
    })
    .catch((error) => {
      console.error('Error fetching customers:', error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    });
};

export const getCustomerById = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  Customer.findOne({
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

export const updateCustomer = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  const { name, phone } = req.body;

  Customer.findOne({
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

      if (!updatedCustomer) return;

      res.status(200).json({
        customer: updatedCustomer,
      });

    })
    .catch((error) => {

      console.error('Error updating customer:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to update customer',
        details: error?.errors?.map((e: any) => e.message),
      });

    });
};

export const deleteCustomer = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  Customer.findOne({
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

      if (!deleted) return;

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