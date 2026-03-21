import { RepasseConfig } from '../models/RepasseConfig';
import { Employee } from '../models/Employee';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Op } from 'sequelize';

export const createRepasseConfig = (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;

  const {
    name,
    responsible_employee_id,
    repasse_employee_id,
    repasse_percentage,
    is_default
  } = req.body;

  if (studio_id === undefined) {
    res.status(400).json({ error: 'Studio ID is required' });
    return;
  }

  const createConfig = () => RepasseConfig.create({
    name,
    responsible_employee_id,
    repasse_employee_id,
    repasse_percentage,
    is_default,
    studio_id
  });

  const promise = is_default
    ? RepasseConfig.update(
        { is_default: false },
        { where: { studio_id } }
      ).then(() => createConfig())
    : createConfig();

  promise
    .then((config) => {
      res.status(201).json({ repasseConfig: config });
    })
    .catch((error) => {

      console.error('Error creating repasse config:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to create repasse config',
        details: error?.errors?.map((e: any) => e.message),
      });

    });
};

export const getRepasseConfigs = (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;

  RepasseConfig.findAll({
    where: { studio_id },
    include: [
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
    order: [['name', 'ASC']]
  })
    .then((configs) => {
      res.status(200).json(configs);
    })
    .catch((error) => {

      console.error('Error fetching repasse configs:', error);

      res.status(500).json({
        error: 'Failed to fetch repasse configs'
      });

    });
};

export const getRepasseConfigById = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  RepasseConfig.findOne({
    where: {
      id,
      studio_id
    },
    include: [
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
  })
    .then((config) => {

      if (!config) {
        res.status(404).json({ error: 'Repasse config not found' });
        return;
      }

      res.status(200).json({ repasseConfig: config });

    })
    .catch((error) => {

      console.error('Error fetching repasse config:', error);

      res.status(500).json({
        error: 'Failed to fetch repasse config'
      });

    });
};

export const updateRepasseConfig = (req: AuthenticatedRequest, res: Response) => {

  const id = Number(req.params.id);
  const studio_id = req.studio?.id;

  const {
    name,
    responsible_employee_id,
    repasse_employee_id,
    repasse_percentage,
    is_default
  } = req.body;

  RepasseConfig.findOne({
    where: {
      id,
      studio_id
    }
  })
    .then((config) => {

      if (!config) {
        res.status(404).json({ error: 'Repasse config not found' });
        return;
      }

      const updateCurrentConfig = () => config.update({
        name,
        responsible_employee_id,
        repasse_employee_id,
        repasse_percentage,
        is_default
      });

      if (is_default) {
        return RepasseConfig.update(
          { is_default: false },
          {
            where: {
              studio_id,
              id: {
                [Op.ne]: id
              }
            }
          }
        ).then(() => updateCurrentConfig());
      }

      return updateCurrentConfig();

    })
    .then((updatedConfig) => {

      if (!updatedConfig) return;

      res.status(200).json({
        repasseConfig: updatedConfig
      });

    })
    .catch((error) => {

      console.error('Error updating repasse config:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to update repasse config',
        details: error?.errors?.map((e: any) => e.message),
      });

    });
};

export const deleteRepasseConfig = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  RepasseConfig.findOne({
    where: {
      id,
      studio_id
    }
  })
    .then((config) => {

      if (!config) {
        res.status(404).json({ error: 'Repasse config not found' });
        return;
      }

      return config.destroy();

    })
    .then((deleted) => {

      if (!deleted) return;

      res.status(200).json({
        message: 'Repasse config deleted successfully'
      });

    })
    .catch((error) => {

      console.error('Error deleting repasse config:', error);

      res.status(500).json({
        error: 'Failed to delete repasse config'
      });

    });
};

export const setDefaultRepasseConfig = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  RepasseConfig.findOne({
    where: {
      id,
      studio_id
    }
  })
    .then((config) => {

      if (!config) {
        res.status(404).json({ error: 'Repasse config not found' });
        return;
      }

      return RepasseConfig.update(
        { is_default: false },
        { where: { studio_id } }
      )
        .then(() => config.update({ is_default: true }));

    })
    .then((updatedConfig) => {

      if (!updatedConfig) return;

      res.status(200).json({
        repasseConfig: updatedConfig
      });

    })
    .catch((error) => {

      console.error('Error setting default repasse config:', error);

      res.status(500).json({
        error: 'Failed to set default repasse config'
      });

    });
};

export const unsetDefaultRepasseConfig = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  RepasseConfig.findOne({
    where: {
      id,
      studio_id
    }
  })
    .then((config) => {

      if (!config) {
        res.status(404).json({ error: 'Repasse config not found' });
        return;
      }

      return config.update({ is_default: false });

    })
    .then((updatedConfig) => {

      if (!updatedConfig) return;

      res.status(200).json({
        repasseConfig: updatedConfig
      });

    })
    .catch((error) => {

      console.error('Error unsetting default repasse config:', error);

      res.status(500).json({
        error: 'Failed to unset default repasse config'
      });

    });
};