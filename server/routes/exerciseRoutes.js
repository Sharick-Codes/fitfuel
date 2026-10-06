import express from 'express';
import { logExercise, getTodayExercises, getExerciseHistory, getWorkoutSuggestions } from '../controllers/exerciseController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/', logExercise);
router.get('/today', getTodayExercises);
router.get('/history', getExerciseHistory);
router.get('/suggestions', getWorkoutSuggestions);

export default router;
