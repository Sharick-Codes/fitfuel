import express from 'express';
import { logMeal, getTodayMeals, getMealHistory, getFavoriteMeals, toggleFavorite, deleteMeal, generateMealPlan, generateGroceryList } from '../controllers/mealController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/', logMeal);
router.get('/today', getTodayMeals);
router.get('/history', getMealHistory);
router.get('/favorites', getFavoriteMeals);
router.get('/plan', generateMealPlan);
router.get('/grocery-list', generateGroceryList);
router.post('/:id/favorite', toggleFavorite);
router.delete('/:id', deleteMeal);

export default router;
