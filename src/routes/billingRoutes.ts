import { Router } from 'express';
import { createCheckoutSession } from '../controllers/billingController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/billing/checkout-session', authMiddleware, createCheckoutSession);

export default router;
