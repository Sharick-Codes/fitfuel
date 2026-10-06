import express from 'express';
import { createGoal, getActiveGoal, updateGoal, getGoalProgress } from '../controllers/goalController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/', createGoal);
router.get('/active', getActiveGoal);
router.get('/progress', getGoalProgress);
router.put('/:id', updateGoal);

export default router;
