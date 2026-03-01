//Studio Routes

import { Router } from 'express';
import { createStudio, getStudios, getStudioById, updateStudio, deleteStudio } from '../controllers/studioController.ts';

const router = Router();

router.post('/studios', createStudio);
router.get('/studios', getStudios);
router.get('/studios/:id', getStudioById);
router.put('/studios/:id', updateStudio);
router.delete('/studios/:id', deleteStudio);

export default router;