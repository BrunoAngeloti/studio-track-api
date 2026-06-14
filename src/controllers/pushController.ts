import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { PushSubscription } from '../models/PushSubscription';

export const getVapidPublicKey = (_req: AuthenticatedRequest, res: Response) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

export const subscribe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studio_id = req.studio?.id;
    if (!studio_id) return res.status(401).json({ message: 'Unauthorized' });

    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: 'endpoint e keys são obrigatórios' });
    }

    await PushSubscription.upsert({
      studio_id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });

    return res.status(201).json({ message: 'Subscription salva' });
  } catch (error) {
    console.error('push subscribe error:', error);
    return res.status(500).json({ message: 'Erro ao salvar subscription' });
  }
};

export const unsubscribe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studio_id = req.studio?.id;
    if (!studio_id) return res.status(401).json({ message: 'Unauthorized' });

    const { endpoint } = req.body;
    if (!endpoint) return res.status(400).json({ message: 'endpoint é obrigatório' });

    await PushSubscription.destroy({ where: { studio_id, endpoint } });

    return res.json({ message: 'Subscription removida' });
  } catch (error) {
    console.error('push unsubscribe error:', error);
    return res.status(500).json({ message: 'Erro ao remover subscription' });
  }
};
