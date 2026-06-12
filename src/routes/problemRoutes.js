import { Router } from 'express';
import { getProblemsController } from '../controllers/problems.js';

const router = Router();

router.get('/', getProblemsController);

export default router;
