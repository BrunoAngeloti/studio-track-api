import { Request, Response } from 'express';
import {
  getDashboardSummaryService,
  getDashboardTimelineService,
  getDashboardTransactionsByCategoryService,
  getDashboardRepassesService,
} from '../services/dashboardService';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const { studio_id, period = 'monthly' } = req.query;

    if (!studio_id) {
      return res.status(400).json({ error: 'studio_id is required' });
    }

    const summary = await getDashboardSummaryService({
      studioId: String(studio_id),
      period: String(period),
    });

    return res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};

export const getDashboardTimeline = async (req: Request, res: Response) => {
  try {
    const { studio_id, period = 'monthly' } = req.query;

    if (!studio_id) {
      return res.status(400).json({ error: 'studio_id is required' });
    }

    const timeline = await getDashboardTimelineService({
      studioId: String(studio_id),
      period: String(period),
    });

    return res.status(200).json(timeline);
  } catch (error) {
    console.error('Error fetching dashboard timeline:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard timeline' });
  }
};

export const getDashboardCategories = async (req: Request, res: Response) => {
  try {
    const { studio_id, period = 'monthly', type } = req.query;

    if (!studio_id) {
      return res.status(400).json({ error: 'studio_id is required' });
    }

    const categories = await getDashboardTransactionsByCategoryService({
      studioId: String(studio_id),
      period: String(period),
      type: type ? String(type) : undefined,
    });

    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching dashboard categories:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard categories' });
  }
};

export const getDashboardRepasses = async (req: Request, res: Response) => {
  try {
    const { studio_id, period = 'monthly' } = req.query;

    if (!studio_id) {
      return res.status(400).json({ error: 'studio_id is required' });
    }

    const repasses = await getDashboardRepassesService({
      studioId: String(studio_id),
      period: String(period),
    });

    return res.status(200).json(repasses);
  } catch (error) {
    console.error('Error fetching dashboard repasses:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard repasses' });
  }
};