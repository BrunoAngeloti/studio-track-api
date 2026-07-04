import { Router } from 'express';
import {
  createCheckoutSession,
  createPortalSession,
  confirmCheckoutSession,
} from '../controllers/billingController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/billing/checkout-session', authMiddleware, createCheckoutSession);
router.get('/billing/checkout-session/confirm', authMiddleware, confirmCheckoutSession);
router.post('/billing/portal-session', authMiddleware, createPortalSession);

export default router;
