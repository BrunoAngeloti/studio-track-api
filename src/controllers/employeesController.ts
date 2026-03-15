import { Employee } from '../models/Employee';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Response } from 'express';
import { Op } from 'sequelize';



export const createEmployee = async (req: AuthenticatedRequest, res: Response) => {

  try {

    const studio_id = req.studio?.id;

    if (!studio_id) {
      return res.status(400).json({ error: 'Studio ID is required' });
    }

    const {
      name,
      role,
    } = req.body;

    const employee = await Employee.create({
      studio_id,
      name,
      role,
      active: true,
    });

    return res.status(201).json({ employee });

  } catch (error: any) {

    console.error('Error creating employee:', error);

    return res.status(400).json({
      error: error?.message ?? 'Failed to create employee',
      details: error?.errors?.map((e: any) => e.message),
    });

  }
};



export const getEmployees = async (req: AuthenticatedRequest, res: Response) => {

  try {

    const studio_id = req.studio?.id;

    const {
      search = '',
      page = '1',
      limit = '20',
      active
    } = req.query as Record<string, string>;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const offset = (pageNumber - 1) * limitNumber;

    const where: any = {
      studio_id,
    };

    if (active !== undefined) {
      where.active = active === 'true';
    }

    if (search) {
      where[Op.or] = [
        {
          name: {
            [Op.iLike]: `%${search}%`,
          },
        },
        {
          role: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
      
    }

    const { rows, count } = await Employee.findAndCountAll({
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

  } catch (error) {

    console.error('Error fetching employees:', error);

    return res.status(500).json({
      error: 'Failed to fetch employees',
    });

  }
};



export const getEmployeeById = async (req: AuthenticatedRequest, res: Response) => {

  try {

    const id = req.params.id;
    const studio_id = req.studio?.id;

    const employee = await Employee.findOne({
      where: {
        id,
        studio_id,
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    return res.status(200).json({ employee });

  } catch (error) {

    console.error('Error fetching employee:', error);

    return res.status(500).json({
      error: 'Failed to fetch employee',
    });

  }
};



export const updateEmployee = async (req: AuthenticatedRequest, res: Response) => {

  try {

    const id = req.params.id;
    const studio_id = req.studio?.id;

    const {
      name,
      role,
      active
    } = req.body;

    const employee = await Employee.findOne({
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

  } catch (error: any) {

    console.error('Error updating employee:', error);

    return res.status(400).json({
      error: error?.message ?? 'Failed to update employee',
      details: error?.errors?.map((e: any) => e.message),
    });

  }
};



export const deleteEmployee = async (req: AuthenticatedRequest, res: Response) => {

  try {

    const id = req.params.id;
    const studio_id = req.studio?.id;

    const employee = await Employee.findOne({
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

  } catch (error) {

    console.error('Error deleting employee:', error);

    return res.status(500).json({
      error: 'Failed to delete employee',
    });

  }
};



export const activateEmployee = async (req: AuthenticatedRequest, res: Response) => {

  try {

    const id = req.params.id;
    const studio_id = req.studio?.id;

    const employee = await Employee.findOne({
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

  } catch (error) {

    console.error('Error activating employee:', error);

    return res.status(500).json({
      error: 'Failed to activate employee',
    });

  }
};