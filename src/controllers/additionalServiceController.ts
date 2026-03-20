import { AdditionalService } from '../models/AdditionalService';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Op } from 'sequelize';

export const createAdditionalService = (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;
  if (!studio_id) {
    return res.status(400).json({ error: 'Studio ID is required' });
  }

  const { name, price } = req.body;

  AdditionalService.create({
    studio_id,
    name,
    price,
    archived: false,
  })
    .then((additionalService) => {
      res.status(201).json({ additionalService });
    })
    .catch((error) => {
      console.error('Error creating additional service:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to create additional service',
        details: error?.errors?.map((e: any) => e.message),
      });
    });
};

export const getAdditionalServices = async (req: AuthenticatedRequest, res: Response) => {

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

    const { rows, count } = await AdditionalService.findAndCountAll({
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

    console.error('Error fetching additional services:', error);

    res.status(500).json({
      error: 'Failed to fetch additional services',
    });

  }

};

export const getArchivedAdditionalServices = async (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;

  try {

    const additionalServices = await AdditionalService.findAll({
      where: {
        studio_id,
        archived: true,
      },
      order: [['name', 'ASC']],
    });

    res.status(200).json(additionalServices);

  } catch (error) {

    console.error('Error fetching archived additional services:', error);

    res.status(500).json({
      error: 'Failed to fetch archived additional services',
    });

  }

};

export const archiveAdditionalService = async (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  try {

    const additionalService = await AdditionalService.findOne({
      where: { id, studio_id },
    });

    if (!additionalService) {
      return res.status(404).json({ error: 'Additional service not found' });
    }

    await additionalService.update({
      archived: true,
    });

    res.status(200).json({
      message: 'Additional service archived',
    });

  } catch (error) {

    console.error('Error archiving additional service:', error);

    res.status(500).json({
      error: 'Failed to archive additional service',
    });

  }

};

export const unarchiveAdditionalService = async (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  try {

    const additionalService = await AdditionalService.findOne({
      where: { id, studio_id },
    });

    if (!additionalService) {
      return res.status(404).json({ error: 'Additional service not found' });
    }

    await additionalService.update({
      archived: false,
    });

    res.status(200).json({
      message: 'Additional service restored',
    });

  } catch (error) {

    console.error('Error restoring additional service:', error);

    res.status(500).json({
      error: 'Failed to restore additional service',
    });

  }

};

export const getAdditionalServiceById = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  AdditionalService.findOne({
    where: {
      id,
      studio_id,
    },
  })
    .then((additionalService) => {

      if (!additionalService) {
        return res.status(404).json({ error: 'Additional service not found' });
      }

      res.status(200).json({ additionalService });

    })
    .catch((error) => {
      console.error('Error fetching additional service:', error);
      res.status(500).json({ error: 'Failed to fetch additional service' });
    });
};

export const updateAdditionalService = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  const { name, price } = req.body;

  AdditionalService.findOne({
    where: { id, studio_id },
  })
    .then((additionalService) => {

      if (!additionalService) {
        res.status(404).json({ error: 'Additional service not found' });
        return;
      }

      return additionalService.update({
        name,
        price,
      });

    })
    .then((updated) => {

      if (!updated) return;

      res.status(200).json({
        additionalService: updated,
      });

    })
    .catch((error) => {

      console.error('Error updating additional service:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to update additional service',
        details: error?.errors?.map((e: any) => e.message),
      });

    });
};

export const deleteAdditionalService = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  AdditionalService.findOne({
    where: { id, studio_id },
  })
    .then((additionalService) => {

      if (!additionalService) {
        res.status(404).json({ error: 'Additional service not found' });
        return;
      }

      return additionalService.destroy();

    })
    .then((deleted) => {

      if (!deleted) return;

      res.status(200).json({
        message: 'Additional service deleted successfully',
      });

    })
    .catch((error) => {

      console.error('Error deleting additional service:', error);

      res.status(500).json({
        error: 'Failed to delete additional service',
      });

    });
};