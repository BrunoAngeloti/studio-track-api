import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getVapidPublicKey, subscribe, unsubscribe } from '../controllers/pushController';

const router = Router();

router.get('/push/vapid-key', authMiddleware, getVapidPublicKey);
router.post('/push/subscribe', authMiddleware, subscribe);
router.post('/push/unsubscribe', authMiddleware, unsubscribe);

export default router;
