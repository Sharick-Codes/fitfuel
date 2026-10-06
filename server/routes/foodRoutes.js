import express from 'express';
import { getFoods, getFoodById, getMealSuggestions, searchFoods, addCustomFood, rateFood } from '../controllers/foodController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.get('/', getFoods);
router.get('/search', searchFoods);
router.get('/suggestions/:mealType', getMealSuggestions);
router.get('/:id', getFoodById);
router.post('/custom', protect, addCustomFood);
router.put('/:id/rate', protect, rateFood);

export default router;
