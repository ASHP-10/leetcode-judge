import { Router } from 'express';
import { getProblemController, getProblemsController } from '../controllers/problems.js';

const router = Router();

router.get('/', getProblemsController);
router.get('/:id', getProblemController);

export default router;
