import { Repasse } from '../models/Repasse';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Response } from 'express';

export const createRepasse = (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;
  if (!studio_id) {
    res.status(400).json({ error: 'Studio ID is required' });
    return;
  }
  const { person_name, percentage } = req.body;

  Repasse.create({ studio_id, person_name, percentage })
    .then((repasse) => {
      res.status(201).json({ repasse });
    })
    .catch((error) => {
      console.error('Error creating repasse:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to create repasse',
        details: error?.errors?.map((e: any) => e.message),
      });
    });
};

export const getRepasses = (req: AuthenticatedRequest, res: Response) => {

  const studio_id = req.studio?.id;

  Repasse.findAll({
    where: { studio_id }
  })
    .then((repasses) => {
      res.status(200).json(repasses);
    })
    .catch((error) => {
      console.error('Error fetching repasses:', error);
      res.status(500).json({ error: 'Failed to fetch repasses' });
    });
};

export const getRepasseById = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  Repasse.findOne({
    where: {
      id,
      studio_id,
    },
  })
    .then((repasse) => {

      if (repasse) {
        res.status(200).json({ repasse });
      } else {
        res.status(404).json({ error: 'Repasse not found' });
      }

    })
    .catch((error) => {
      console.error('Error fetching repasse:', error);
      res.status(500).json({ error: 'Failed to fetch repasse' });
    });
};

export const updateRepasse = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;
  const { person_name, percentage } = req.body;

  Repasse.findOne({
    where: {
      id,
      studio_id,
    },
  })
    .then((repasse) => {

      if (!repasse) {
        res.status(404).json({ error: 'Repasse not found' });
        return;
      }

      return repasse.update({
        person_name,
        percentage,
      });

    })
    .then((updatedRepasse) => {

      if (updatedRepasse) {
        res.status(200).json({ repasse: updatedRepasse });
      }

    })
    .catch((error) => {

      console.error('Error updating repasse:', error);

      res.status(400).json({
        error: error?.message ?? 'Failed to update repasse',
        details: error?.errors?.map((e: any) => e.message),
      });
    });
};

export const deleteRepasse = (req: AuthenticatedRequest, res: Response) => {

  const id = req.params.id;
  const studio_id = req.studio?.id;

  Repasse.findOne({
    where: {
      id,
      studio_id,
    },
  })
    .then((repasse) => {

      if (!repasse) {
        res.status(404).json({ error: 'Repasse not found' });
        return;
      }

      return repasse.destroy();

    })
    .then(() => {

      res.status(200).json({
        message: 'Repasse deleted successfully',
      });

    })
    .catch((error) => {

      console.error('Error deleting repasse:', error);

      res.status(500).json({
        error: 'Failed to delete repasse',
      });
    });
};