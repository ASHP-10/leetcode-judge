import { Router } from 'express';
import { getProblemByIdController, getProblemsController } from '../controllers/problemController.js';

const router = Router();

router.get('/', getProblemsController);
router.get('/:id', getProblemByIdController);

export default router;
