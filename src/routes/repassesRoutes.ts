import { Router } from 'express';
import {
  createRepasse,
  getRepasses,
  getRepasseById,
  getRepassesByStudioId,
  updateRepasse,
  deleteRepasse,
} from '../controllers/repassesController.ts';

const router = Router();

router.post('/repasses', createRepasse);
router.get('/repasses', getRepasses);
router.get('/repasses/studio/:studioId', getRepassesByStudioId);
router.get('/repasses/:id', getRepasseById);
router.put('/repasses/:id', updateRepasse);
router.delete('/repasses/:id', deleteRepasse);

export default router;