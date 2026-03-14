import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import {
  getDashboardSummaryService,
  getDashboardTimelineService,
  getDashboardTransactionsByCategoryService,
  getDashboardRepassesService,
} from '../services/dashboardService';

export const getDashboardSummary = async (req: AuthenticatedRequest, res: Response) => {
  try {

    const studioId = req.studio?.id;
    const { period = 'monthly' } = req.query;

    const summary = await getDashboardSummaryService({
      studioId: String(studioId),
      period: String(period),
    });

    return res.status(200).json(summary);

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
};

export const getDashboardTimeline = async (req: AuthenticatedRequest, res: Response) => {
  try {

    const studioId = req.studio?.id;
    const { period = 'monthly' } = req.query;

    const timeline = await getDashboardTimelineService({
      studioId: String(studioId),
      period: String(period),
    });

    return res.status(200).json(timeline);

  } catch (error) {
    console.error('Error fetching dashboard timeline:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard timeline' });
  }
};

export const getDashboardCategories = async (req: AuthenticatedRequest, res: Response) => {
  try {

    const studioId = req.studio?.id;
    const { period = 'monthly', type } = req.query;

    const categories = await getDashboardTransactionsByCategoryService({
      studioId: String(studioId),
      period: String(period),
      type: type ? String(type) : undefined,
    });

    return res.status(200).json(categories);

  } catch (error) {
    console.error('Error fetching dashboard categories:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard categories' });
  }
};

export const getDashboardRepasses = async (req: AuthenticatedRequest, res: Response) => {
  try {

    const studioId = req.studio?.id;
    const { period = 'monthly' } = req.query;

    const repasses = await getDashboardRepassesService({
      studioId: String(studioId),
      period: String(period),
    });

    return res.status(200).json(repasses);

  } catch (error) {
    console.error('Error fetching dashboard repasses:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard repasses' });
  }
};