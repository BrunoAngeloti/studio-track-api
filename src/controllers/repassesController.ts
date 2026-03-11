import { Repasse } from '../models/Repasse';
import { Request, Response } from 'express';

export const createRepasse = (req: Request, res: Response) => {
  const { studio_id, person_name, percentage } = req.body;

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

export const getRepasses = (req: Request, res: Response) => {
  Repasse.findAll()
    .then((repasses) => {
      res.status(200).json(repasses);
    })
    .catch((error) => {
      console.error('Error fetching repasses:', error);
      res.status(500).json({ error: 'Failed to fetch repasses' });
    });
};

export const getRepasseById = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  Repasse.findByPk(id)
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

export const getRepassesByStudioId = (req: Request, res: Response) => {
  const rawStudioId = req.params.studioId;
  const studioId = Array.isArray(rawStudioId) ? rawStudioId[0] : rawStudioId;

  Repasse.findAll({ where: { studio_id: studioId } })
    .then((repasses) => {
      res.status(200).json(repasses);
    })
    .catch((error) => {
      console.error('Error fetching repasses by studio ID:', error);
      res.status(500).json({ error: 'Failed to fetch repasses by studio ID' });
    });
};

export const updateRepasse = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { person_name, percentage } = req.body;

  Repasse.findByPk(id)
    .then((repasse) => {
      if (repasse) {
        repasse
          .update({ person_name, percentage })
          .then((updatedRepasse) => {
            res.status(200).json({ repasse: updatedRepasse });
          })
          .catch((error) => {
            console.error('Error updating repasse:', error);
            res.status(400).json({
              error: error?.message ?? 'Failed to update repasse',
              details: error?.errors?.map((e: any) => e.message),
            });
          });
      } else {
        res.status(404).json({ error: 'Repasse not found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching repasse for update:', error);
      res.status(500).json({ error: 'Failed to fetch repasse for update' });
    });
};

export const deleteRepasse = (req: Request, res: Response) => {
  const rawId = req.params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  Repasse.findByPk(id)
    .then((repasse) => {
      if (repasse) {
        repasse
          .destroy()
          .then(() => {
            res.status(200).json({ message: 'Repasse deleted successfully' });
          })
          .catch((error) => {
            console.error('Error deleting repasse:', error);
            res.status(500).json({ error: 'Failed to delete repasse' });
          });
      } else {
        res.status(404).json({ error: 'Repasse not found' });
      }
    })
    .catch((error) => {
      console.error('Error fetching repasse for deletion:', error);
      res.status(500).json({ error: 'Failed to fetch repasse for deletion' });
    });
};