import { Service } from '../models/Service';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Op } from 'sequelize';

export const createService = (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;
  if (!studio_id) {
    return res.status(400).json({ error: 'Studio ID is required' });
  }

  const { name, description, price } = req.body;

  Service.create({
    studio_id,
    name,
    description,
    price,
    archived: false,
  })
    .then((service) => {
      res.status(201).json({ service });
    })
    .catch((error) => {
      console.error('Error creating service:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to create service',
        details: error?.errors?.map((e: any) => e.message),
      });
    });
};

export const getServices = async (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;

  const {
    search = '',
    page = 1,
    limit = 20,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  const where: any = {
    studio_id,
    archived: false,
  };

  if (search) {
    where.name = {
      [Op.iLike]: `%${search}%`,
    };
  }

  try {

    const { rows, count } = await Service.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['name', 'ASC']],
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

    console.error('Error fetching services:', error);

    res.status(500).json({
      error: 'Failed to fetch services',
    });

  }

};

export const getArchivedServices = async (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;

  try {

    const services = await Service.findAll({
      where: {
        studio_id,
        archived: true,
      },
      order: [['name', 'ASC']],
    });

    res.status(200).json(services);

  } catch (error) {

    console.error('Error fetching archived services:', error);

    res.status(500).json({
      error: 'Failed to fetch archived services',
    });

  }

};

export const archiveService = async (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  try {

    const service = await Service.findOne({
      where: { id, studio_id },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await service.update({
      archived: true,
    });

    res.status(200).json({
      message: 'Service archived',
    });

  } catch (error) {

    console.error('Error archiving service:', error);

    res.status(500).json({
      error: 'Failed to archive service',
    });

  }

};

export const unarchiveService = async (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  try {

    const service = await Service.findOne({
      where: { id, studio_id },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await service.update({
      archived: false,
    });

    res.status(200).json({
      message: 'Service restored',
    });

  } catch (error) {

    console.error('Error restoring service:', error);

    res.status(500).json({
      error: 'Failed to restore service',
    });

  }

};

export const getServiceById = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  Service.findOne({
    where: {
      id,
      studio_id,
    },
  })
    .then((service) => {

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.status(200).json({ service });

    })
    .catch((error) => {
      console.error('Error fetching service:', error);
      res.status(500).json({ error: 'Failed to fetch service' });
    });
};

export const updateService = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  const { name, description, price } = req.body;

  Service.findOne({
    where: { id, studio_id },
  })
    .then((service) => {

      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }

      return service.update({
        name,
        description,
        price,
      });

    })
    .then((updatedService) => {

      if (!updatedService) return;

      res.status(200).json({
        service: updatedService,
      });

    })
    .catch((error) => {

      console.error('Error updating service:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to update service',
        details: error?.errors?.map((e: any) => e.message),
      });

    });
};

export const deleteService = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  Service.findOne({
    where: { id, studio_id },
  })
    .then((service) => {

      if (!service) {
        res.status(404).json({ error: 'Service not found' });
        return;
      }

      return service.destroy();

    })
    .then((deleted) => {

      if (!deleted) return;

      res.status(200).json({
        message: 'Service deleted successfully',
      });

    })
    .catch((error) => {

      console.error('Error deleting service:', error);

      res.status(500).json({
        error: 'Failed to delete service',
      });

    });
};